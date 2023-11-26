/* eslint-disable no-inner-declarations */
import { HierarchyPointNode } from "d3";
import { createContext, LegacyRef, useEffect, useRef, useState } from "react";
import {
  Orientation,
  Point,
  Tree,
  TreeNodeDatum,
  TreeProps,
} from "react-d3-tree";

import { getErrorMessage } from "../../logger";
import { convertToD3Format } from "../../parser";
import { TreeHierarchyNode, TreeNode } from "../../types";
import { sortPaths } from "../../utils/paths";

type UpdateTreeFunction = (a: Partial<TreeProps>) => void;
type UpdateNodeFunction = (a: HierarchyPointNode<TreeNodeDatum>) => void;
type HighlightPathFunction = (
  rd3tNode: TreeNode,
  evt: React.MouseEvent,
  orientation: Orientation
) => void;
type RemoveHighlightPathFunction = (evt: React.MouseEvent) => void;
type OnNodeClickFunction = (
  a: HierarchyPointNode<TreeNodeDatum>,
  event: React.MouseEvent
) => void;
type SetNodeClickFunction = (func: OnNodeClickFunction) => void;

export type ProviderValue = {
  treeState: Partial<TreeProps>; // since you know this is what the provider will be passing
  selectedNode?: TreeHierarchyNode;
  loaded: boolean;
  treeRef: LegacyRef<Tree> | undefined;
  highlightPathToNode: HighlightPathFunction;
  removeHighlightPathToNode: RemoveHighlightPathFunction;
  onNodeClick: OnNodeClickFunction;
  setOnNodeClick: SetNodeClickFunction;
  updateTreeState: UpdateTreeFunction;
  updateSelectedNode: UpdateNodeFunction;
};

export type DefaultValue = undefined;

export type ContextValue = DefaultValue | ProviderValue;

interface TreeProviderProps {
  children: React.ReactNode;
  orientation: Orientation;
  translate: Point;
  setTranslate;
}

export const TreeContext = createContext<ContextValue>(undefined);

export const TreeProvider = ({
  children,
  orientation,
  translate,
}: TreeProviderProps) => {
  const [loaded, setLoaded] = useState(false);
  const [selectedNode, setSelectedNode] = useState<TreeHierarchyNode>();
  const treeRef = useRef<Element>();
  const [onNodeClick, setOnNodeClick] = useState<OnNodeClickFunction>(
    () => () => {
      // No operation
    }
  );

  const [treeElement, setTreeElement] = useState<Element>();
  const [treeState, setTreeState] = useState<TreeProps>({
    centeringTransitionDuration: 800,
    collapsible: true,
    data: [],
    depthFactor: undefined,
    dimensions: undefined,
    draggable: true,
    enableLegacyTransitions: false,
    hasInteractiveNodes: true,
    initialDepth: 1,
    nodeSize: { x: 100, y: 100 },
    orientation: "vertical",
    rootNodeClassName: "tree__root",
    branchNodeClassName: "tree__branch",
    leafNodeClassName: "tree__leaf",
    scaleExtent: { min: 0.25, max: 2 },
    separation: { siblings: 0.5, nonSiblings: 0 },
    shouldCollapseNeighborNodes: true,
    transitionDuration: 500,
    translate: { x: 0, y: 0 },
    zoom: 1,
    zoomable: true,
  });

  useEffect(() => {
    if (treeRef.current instanceof Tree) {
      const element = document.getElementsByClassName(
        treeRef.current.gInstanceRef
      )[0];
      setTreeElement(element);
    }
  }, [treeRef.current]);

  useEffect(() => {
    const { x: width, y: height } = translate;
    if (orientation === "vertical") {
      updateTreeState({
        orientation: orientation,
        separation: { siblings: 1, nonSiblings: 2 },
        dimensions: { width, height },
        translate: { x: width / 2, y: height },
        zoom: 1,
      });
    } else {
      updateTreeState({
        orientation: orientation,
        separation: { siblings: 0.5, nonSiblings: 0 },
        dimensions: { width, height },
        translate: { x: width, y: height },
        zoom: 1,
      });
    }
  }, [orientation, translate]);

  useEffect(() => {
    // Function to add message listener
    function addMessageListener() {
      chrome.runtime.onMessage.addListener(handleMessageFromContentScript);
    }

    // Function to remove message listener
    function removeMessageListener() {
      chrome.runtime.onMessage.removeListener(handleMessageFromContentScript);
    }

    // Add listener when component mounts
    addMessageListener();

    // Remove listener when component unmounts
    return () => removeMessageListener();

    // The empty dependency array ensures this runs only on mount and unmount
  }, []);

  function handleMessageFromContentScript(message) {
    console.log(
      "🚀 ---------------------------------------------------------------------------------------🚀"
    );
    console.log(
      "🚀 ⚛︎ file: tree_provider.tsx:148 ⚛︎ handleMessageFromContentScript ⚛︎ message:",
      message
    );
    console.log(
      "🚀 ---------------------------------------------------------------------------------------🚀"
    );

    if (message.action === "process-selected-element") {
      console.log("PROCESSING SELECTED", message.data);
      // Process the received data and update the state
      const newData = convertToD3Format(message.data); // Adjust this as needed
      updateTreeState({
        data: newData,
        dimensions: { width: translate.x, height: translate.y },
        translate: { x: translate.x / 2, y: translate.y / 2 },
      });
    }
    // Handle other actions as needed
  }

  useEffect(() => {
    if (!loaded) {
      try {
        // @ts-ignore ajhlksdjlksa
        async function scanActiveTabHTML(message: {
          target: string;
          action: string;
        }) {
          if (!chrome.tabs) {
            // console.log(chrome.tabs);
            throw new Error("no tabs");
          }
          chrome.tabs.query(
            { active: true, lastFocusedWindow: true },
            async (tabs) => {
              //   console.log("tabs", tabs, message);
              if (tabs[0]?.id) {
                const response = await chrome.tabs.sendMessage(
                  tabs[0].id,
                  message
                );
                // @ts-ignore asdsad
                if (response?.data) {
                  // @ts-ignore asdsad
                  const r3dtNodes = await convertToD3Format(response.data);
                  updateTreeState({
                    data: r3dtNodes,
                    dimensions: { width: translate.x, height: translate.y },
                    translate: { x: translate.x / 2, y: translate.y / 2 },
                  });
                  setLoaded(true);
                }
              }
            }
          );
        }
        scanActiveTabHTML({
          target: "popup",
          action: "extension-scan-element",
        });
      } catch (error) {
        reportError({ message: getErrorMessage(error) });
      }
    }
  }, [translate, loaded]);

  const highlightPathToNode = (rd3tNode, evt, orientation) => {
    // Ensure treeElement is an SVGElement before proceeding
    if (treeElement instanceof SVGElement) {
      //@ts-ignore asd
      const selectedNodeChildCount = selectedNode.data.children.length;
      // Retrieve the last 'selectedNodeChildCount' number of link paths
      const linkPaths = Array.from(
        treeElement.querySelectorAll("path.rd3t-link")
      );
      const relevantPaths = linkPaths.slice(-selectedNodeChildCount);

      // Find the current-path element and remove it
      const currentPath = treeElement.querySelector("#current-path");
      if (currentPath) {
        currentPath.removeAttribute("id");
        currentPath.classList.remove("highlight");
      }

      // Reset styles for all relevant paths and dim descendant paths
      relevantPaths.forEach((path) => {
        path.classList.remove("highlight");
        path.classList.add("current-paths");
        path.removeAttribute("id");
      });
      const sortedPaths = sortPaths(relevantPaths, orientation).filter(
        (el) => el.id !== "current-path"
      );
      // Highlight the specific path for the selected child node
      const selectedChildIdx = rd3tNode.attributes.childIndex - 1;
      const selectedPath = sortedPaths[selectedChildIdx];
      if (selectedPath) {
        selectedPath.id = "current-path";
        selectedPath.classList.add("highlight");
        // Use the sorting function based on orientation
        // sortedPaths.forEach((path) => );
        // Find the first <g> element within treeElement
        const firstGElement = treeElement.querySelector("g");
        // Append sorted paths before the first <g> element
        sortedPaths.forEach((path) => {
          path.remove();
          if (firstGElement) {
            treeElement.insertBefore(path, firstGElement);
          } else {
            treeElement.appendChild(path);
          }
        });

        // Ensure the current-path is last among the paths
        const currentPathElement = treeElement.querySelector("#current-path");
        if (currentPathElement) {
          if (firstGElement) {
            treeElement.insertBefore(currentPathElement, firstGElement);
          } else {
            treeElement.appendChild(currentPathElement);
          }
        }
      }
    }
    // Stop the event from bubbling up to avoid unintended effects
    evt.stopPropagation();
  };

  const removeHighlightPathToNode = (evt) => {
    if (treeElement instanceof SVGElement) {
      const linkPaths = Array.from(
        treeElement.querySelectorAll("path.rd3t-link")
      );
      linkPaths.forEach((path) => {
        path.classList.remove("highlight");
        path.classList.remove("current-paths");
        path.removeAttribute("id");
      });
    }
    evt.stopPropagation();
  };

  const updateTreeState = (newState: Partial<TreeProps>) => {
    setTreeState((prevState) => ({ ...prevState, ...newState }));
  };

  const updateSelectedNode = (newState: TreeHierarchyNode) => {
    setSelectedNode((prevState) => ({ ...prevState, ...newState }));
  };

  const value = {
    loaded,
    treeState,
    selectedNode,
    onNodeClick,
    setOnNodeClick,
    treeRef,
    highlightPathToNode,
    removeHighlightPathToNode,
    updateTreeState,
    updateSelectedNode,
  };

  return (
    <TreeContext.Provider
      value={{
        loaded: value.loaded,
        treeState: value.treeState,
        selectedNode: value.selectedNode,
        onNodeClick: value.onNodeClick,
        setOnNodeClick: value.setOnNodeClick,
        treeRef: value.treeRef as unknown as React.LegacyRef<Tree> | undefined,
        highlightPathToNode: value.highlightPathToNode,
        removeHighlightPathToNode: value.removeHighlightPathToNode,
        updateTreeState: value.updateTreeState,
        updateSelectedNode: value.updateSelectedNode as UpdateNodeFunction,
      }}
    >
      {children}
    </TreeContext.Provider>
  );
};
