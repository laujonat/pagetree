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
import { genTreeData } from "../../utils/d3node";
import {
  renderForeignObjectNode,
  sortPaths,
  updateCurrentNode,
} from "../../utils/treeutils";

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
  treeRef: LegacyRef<SVGElement> | undefined;
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
  settings: Partial<TreeProps>;
  translate: Point;
  setTranslate;
}

export const TreeContext = createContext<ContextValue>(undefined);

const clickEvent = new MouseEvent("click", {
  view: window,
  bubbles: true,
  cancelable: true,
});

export const TreeProvider = ({
  children,
  translate,
  setTranslate,
  settings,
}: TreeProviderProps) => {
  const [loaded, setLoaded] = useState(false);
  const [selectedNode, setSelectedNode] =
    useState<HierarchyPointNode<TreeNodeDatum>>();
  const treeRef = useRef<Tree>();
  const [onNodeClick, setOnNodeClick] = useState<OnNodeClickFunction>(
    () => () => {}
  );
  const [treeElement, setTreeElement] = useState<Element>();
  const [treeState, setTreeState] = useState<TreeProps>({
    centeringTransitionDuration: 500,
    collapsible: true,
    data: [],
    dataKey: "initial-key",
    depthFactor: undefined,
    dimensions: undefined,
    draggable: true,
    enableLegacyTransitions: false,
    hasInteractiveNodes: true,
    initialDepth: 1,
    nodeSize: { x: 100, y: 100 },
    orientation: settings.orientation,
    rootNodeClassName: "tree__root",
    branchNodeClassName: "tree__branch",
    leafNodeClassName: "tree__leaf",
    pathFunc: settings.pathFunc,
    scaleExtent: { min: 0.25, max: 2 },
    separation: { siblings: 0.5, nonSiblings: 0 },
    shouldCollapseNeighborNodes: settings.shouldCollapseNeighborNodes,
    svgClassName: "pageTree__root",
    transitionDuration: 500,
    translate: translate,
    zoom: 1.5,
    zoomable: true,
    onUpdate: () => {
      if (treeElement instanceof SVGElement) {
        const { width, height } = treeElement.getBoundingClientRect();
        setTranslate({ x: width / 2, y: height / 2 });
        if (settings.pathFunc !== "step") {
          const linksWithCrispEdges =
            treeElement.querySelectorAll(".link--crisp-edges");

          // Remove the 'link--crisp-edges' class from each link
          linksWithCrispEdges.forEach((link) => {
            link.classList.remove("link--crisp-edges");
          });
        }
      }
    },
    renderCustomNodeElement: (rd3tProps) =>
      renderForeignObjectNode({
        ...rd3tProps,
      }),
    onNodeClick: (...args) => {
      const [node] = args;
      updateSelectedNode(node);
      setOnNodeClick(() => () => {
        updateSelectedNode(node);
      });
    },
    pathClassFunc: ({ source, target }) => {
      updateCurrentNode(source, target);
      let classes = "";
      console.log(settings.pathFunc);
      if (settings.pathFunc === "step") {
        classes += "link--crisp-edges ";
      }
      classes += !target.children ? "link__to-leaf" : "link__to-branch";

      return classes;
    },
  });

  useEffect(() => {
    if (treeRef.current instanceof Tree) {
      const tElement = document.getElementsByClassName(
        treeRef.current.gInstanceRef
      )[0] as SVGElement;
      setTreeElement(tElement);
    }
  }, [treeRef.current]);

  const updateTreeState = async (
    newState: Partial<TreeProps>,
    isNewTree: boolean = false
  ) => {
    console.log(newState);
    setTreeState((prevState) => ({
      ...prevState,
      ...newState,
      dataKey: isNewTree ? `tree-${Date.now()}` : prevState.dataKey,
    }));
  };

  const updateSelectedNode = (newState: HierarchyPointNode<TreeNodeDatum>) => {
    console.log("newState", newState);
    setSelectedNode(newState);
  };
  useEffect(() => {
    updateTreeState({
      orientation: settings.orientation,
      separation:
        settings.orientation === "vertical"
          ? { siblings: 0.75, nonSiblings: 1.5 }
          : { siblings: 0.5, nonSiblings: 0 },
      dimensions: { width: translate.x * 2, height: translate.y * 2 }, // Assuming full container dimensions
      translate: translate, // Use calculated translate
      zoom: 1.5,
    });
  }, [settings.orientation, translate]);

  useEffect(() => {
    setTreeState((prevState) => ({
      ...prevState,
      ...settings,
    }));
  }, [settings]);

  const [shouldDispatchClick, setShouldDispatchClick] = useState(false);

  useEffect(() => {
    if (shouldDispatchClick && treeRef.current) {
      getRootForeignObject().dispatchEvent(clickEvent);
      setShouldDispatchClick(false); // Reset the flag
    }
  }, [treeState.data, shouldDispatchClick]); // Run when tree data or shouldDispatchClick changes

  useEffect(() => {
    const handleMessage = async (message) => {
      if (message.action === "process-context-menu-selection") {
        setLoaded(false);
        const r3dtNodes = await genTreeData(message.data);
        await updateTreeState({ data: r3dtNodes }, true);
        setLoaded(true);
        setShouldDispatchClick(true);
      }
      return true;
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [updateTreeState]);

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
                  const r3dtNodes = await genTreeData(response.data);
                  updateTreeState(
                    {
                      data: r3dtNodes,
                      dimensions: {
                        width: translate.x / 2,
                        height: translate.y,
                      },
                      translate: { x: translate.x / 2, y: translate.y / 2 },
                    },
                    true
                  );
                  setLoaded(true);
                }
              }
            }
          );
        }
        scanActiveTabHTML({
          target: "sidepanel",
          action: "extension-scan-page",
        });
      } catch (error) {
        reportError({ message: getErrorMessage(error) });
      }
    }
  }, [translate, loaded]);

  function getTreeElement() {
    if (!treeRef.current) {
      throw new Error("RefErr"); // throw keyword is used here
    }
    return document.getElementsByClassName(
      treeRef.current.gInstanceRef
    )[0] as SVGElement;
  }

  function getRootElementFromTree() {
    return getTreeElement().getElementsByTagName("g")[0] as SVGElement;
  }

  function getRootForeignObject() {
    return getRootElementFromTree().getElementsByTagName("foreignObject")[0];
  }

  function highlightSelectedPath(paths, selectedChildIndex) {
    if (selectedChildIndex < 0 || selectedChildIndex >= paths.length) {
      throw new Error("IndexOutOfBounds");
    }
    const selectedPath = paths[selectedChildIndex];
    if (selectedPath) {
      selectedPath.id = "current-path";
      selectedPath.classList.add("highlight");
    }

    return selectedPath;
  }

  function selectNodeDescendantPaths() {
    if (!(treeElement instanceof SVGElement)) {
      throw new Error("TreeReferenceError");
    }
    //@ts-ignore asd
    const selectedNodeChildCount = selectedNode.data.children.length;
    // Retrieve the last 'selectedNodeChildCount' number of link paths
    const linkPaths = Array.from(
      treeElement.querySelectorAll("path.rd3t-link")
    );
    const relevantPaths = linkPaths.slice(-selectedNodeChildCount);
    return relevantPaths;
  }
  function removeDescendantPathStyles() {
    const paths = selectNodeDescendantPaths();
    paths.forEach((path) => {
      path.classList.remove("highlight");
      path.classList.add("current-paths");
      path.removeAttribute("id");
    });
    return paths;
  }
  const highlightPathToNode = (rd3tNode, evt, orientation) => {
    if (!settings.shouldCollapseNeighborNodes) return false;
    // Ensure treeElement is an SVGElement before proceeding
    if (treeElement instanceof SVGElement) {
      const relevantPaths = selectNodeDescendantPaths();

      // Reset styles for all relevant paths and dim descendant paths

      const sortedPaths = sortPaths(relevantPaths, orientation).filter(
        (el) => el.id !== "current-path"
      );
      // Highlight the specific path for the selected child node
      const selectedChildIdx = rd3tNode.attributes.childIndex - 1;
      highlightSelectedPath(sortedPaths, selectedChildIdx);
      const firstGElement = getRootElementFromTree();
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
    // Stop the event from bubbling up to avoid unintended effects
    evt.stopPropagation();
  };

  const removeHighlightPathToNode = (evt) => {
    try {
      removeDescendantPathStyles();
    } catch (e) {
      throw new Error("DomErr");
    }
    evt.stopPropagation();
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
        treeRef: value.treeRef as unknown as
          | React.LegacyRef<SVGElement>
          | undefined,
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
