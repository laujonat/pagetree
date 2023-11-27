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
import { TreeHierarchyNode, TreeNode } from "../../types";
import { convertToD3Format } from "../../utils/parser";
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
    dimensions: { width: translate.x / 2, height: translate.y / 2 },
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
    translate: translate,
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
    updateTreeState({
      orientation: orientation,
      separation:
        orientation === "vertical"
          ? { siblings: 1, nonSiblings: 1 }
          : { siblings: 0.5, nonSiblings: 0 },
      dimensions: { width: translate.x * 2, height: translate.y * 2 }, // Assuming full container dimensions
      translate: translate, // Use calculated translate
      zoom: 1,
    });
  }, [orientation, translate]);

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
                    dimensions: { width: translate.x / 2, height: translate.y },
                    translate: { x: translate.x / 2, y: translate.y / 2 },
                  });
                  setLoaded(true);
                }
              }
            }
          );
        }
        scanActiveTabHTML({
          target: "sidepanel",
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
