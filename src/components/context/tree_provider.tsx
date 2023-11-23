/* eslint-disable no-inner-declarations */
import { HierarchyPointNode } from "d3";
// @ts-nocheck asjdlksa
import React, {
  createContext,
  LegacyRef,
  useEffect,
  useRef,
  useState,
} from "react";
import Tree, {
  Orientation,
  Point,
  TreeNodeDatum,
  TreeProps,
} from "react-d3-tree";

import { getErrorMessage } from "../../logger";
import { convertToD3Format } from "../../parser";
import { TreeHierarchyNode, TreeNode } from "../../types";
import { isElementInViewportWithZoom } from "../../utils/viewport";

type UpdateTreeFunction = (a: Partial<TreeProps>) => void;
type UpdateNodeFunction = (a: HierarchyPointNode<TreeNodeDatum>) => void;
type HighlightPathFunction = (
  rd3tNode: TreeNode,
  evt: React.MouseEvent
) => void;
type RemoveHighlightPathFunction = (evt: React.MouseEvent) => void;

export type ProviderValue = {
  treeState: Partial<TreeProps>; // since you know this is what the provider will be passing
  selectedNode?: TreeHierarchyNode;
  loaded: boolean;
  treeRef: LegacyRef<Tree> | undefined;
  highlightPathToNode: HighlightPathFunction;
  removeHighlightPathToNode: RemoveHighlightPathFunction;
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
  setTranslate,
}: TreeProviderProps) => {
  const [loaded, setLoaded] = useState(false);
  const [selectedNode, setSelectedNode] = useState<TreeHierarchyNode>();
  const treeRef = useRef<Element>();
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
    console.log("TREEREF", treeRef);
    if (treeRef.current instanceof Tree) {
      const element = document.getElementsByClassName(
        treeRef.current.gInstanceRef
      )[0];
      setTreeElement(element);
    }
  }, [treeRef.current]);

  useEffect(() => {
    console.log("tree-provider- orientation", orientation);
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
    if (!loaded) {
      try {
        // @ts-ignore ajhlksdjlksa
        async function scanActiveTabHTML(message: {
          target: string;
          action: string;
        }) {
          if (!chrome.tabs) {
            console.log(chrome.tabs);
            throw new Error("no tabs");
          }
          chrome.tabs.query(
            { active: true, lastFocusedWindow: true },
            async (tabs) => {
              console.log("tabs", tabs, message);
              if (tabs[0]?.id) {
                const response = await chrome.tabs.sendMessage(
                  tabs[0].id,
                  message
                );
                console.log("response", response);
                // @ts-ignore asdsad
                if (response?.data) {
                  // @ts-ignore asdsad
                  const r3dtNodes = await convertToD3Format(response.data);
                  console.log(r3dtNodes);
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
        console.log("scanActiveTabHTML", chrome.tabs.onUpdated);
        scanActiveTabHTML({
          target: "popup",
          action: "extension-scan-element",
        });
      } catch (error) {
        reportError({ message: getErrorMessage(error) });
      }
    }
  }, [translate, loaded]);

  function sanitizeId(id) {
    // Check if the first character is a digit
    if (/^\d/.test(id)) {
      // If it starts with a digit, add a backslash before it
      return `\\${id}`;
    } else {
      // Otherwise, return the original ID
      return id;
    }
  }

  function swapElements(el1, el2) {
    // Ensure both elements exist
    if (!el1 || !el2) {
      console.error("Both elements must exist to perform a swap.");
      return;
    }

    // Create a placeholder for the swap
    const placeholder = document.createElement("div");
    console.log("parentnode", el1.parentNode);
    el1.parentNode.insertBefore(placeholder, el1);

    // Move el2 to the position of el1
    el1.parentNode.insertBefore(el2, el1);
    // Move el1 to the original position of el2
    if (placeholder.parentNode) {
      placeholder.parentNode.insertBefore(el1, placeholder);
    }

    // Remove the placeholder
    if (placeholder.parentNode) {
      placeholder.parentNode.removeChild(placeholder);
    }
  }

  const highlightPathToNode = (rd3tNode, evt) => {
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

      // Highlight the specific path for the selected child node
      const selectedChildIdx = rd3tNode.attributes.childIndex - 1;
      const selectedPath = relevantPaths[selectedChildIdx];

      if (selectedPath) {
        selectedPath.id = "current-path";
        selectedPath.classList.remove("current-paths");
        selectedPath.classList.add("highlight");

        // Sort the paths based on the d attribute
        const sortedPaths = relevantPaths.sort((a, b) => {
          const aD = a.getAttribute("d");
          const bD = b.getAttribute("d");

          const aValueMatch = aD ? aD.match(/H(-?\d+)/) : null;
          const bValueMatch = bD ? bD.match(/H(-?\d+)/) : null;

          const aValue = aValueMatch ? parseInt(aValueMatch[1], 10) : 0;
          const bValue = bValueMatch ? parseInt(bValueMatch[1], 10) : 0;

          return aValue - bValue;
        });

        sortedPaths.forEach((path) => path.remove());

        // Find the first <g> element within treeElement
        const firstGElement = treeElement.querySelector("g");

        // Append sorted paths before the first <g> element, or append at the end if no <g> element is found
        sortedPaths.forEach((path) => {
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
      const nodeId = rd3tNode.__rd3t.id;
      const sanitizedNodeId = sanitizeId(nodeId);

      const node = treeElement.querySelector(`g#${sanitizedNodeId}`);

      if (node instanceof SVGElement) {
        // Get the container element for zoom calculations

        // Specify the zoom factor (1 for no zoom, greater than 1 for zoom-in, less than 1 for zoom-out)
        const zoomFactor = treeState.zoom as number; // Adjust this value as needed

        // Check if the element is in the viewport and calculate translations
        const viewportInfo = isElementInViewportWithZoom(
          node,
          treeElement,
          zoomFactor
        );
        console.log("viewportinfo", viewportInfo);
        if (viewportInfo) {
          // Element is in the viewport, set the translations to center it
          //   setTranslate({
          //     x: viewportInfo.translateX / 2,
          //     y: viewportInfo.translateY / 2,
          //   });
        }
      }
    }

    // Stop the event from bubbling up to avoid unintended effects
    evt.stopPropagation();
  };

  const removeHighlightPathToNode = (evt) => {
    // if (treeElement instanceof SVGElement) {
    //   const linkPaths = Array.from(
    //     treeElement.querySelectorAll("path.rd3t-link")
    //   );
    //   linkPaths.forEach((path) => {
    //     path.classList.remove("highlight");
    //     path.classList.remove("current-paths");
    //     path.removeAttribute("id");
    //   });
    // }
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
