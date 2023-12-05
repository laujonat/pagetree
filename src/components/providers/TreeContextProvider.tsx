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

import { MessageContent, MessageTarget } from "../../constants";
import useChrome from "../../hooks/useChrome";
import { Dimension, TreeHierarchyNode, TreeNode } from "../../types";
import { genTreeData } from "../../utils/genTreeNodesHelper";
import {
  renderForeignObjectNode,
  sortPaths,
  updateCurrentNode,
} from "../../utils/genTreePathsHelper";

type UpdateTreeFunction = (a: Partial<TreeProps>) => void;
type UpdateNodeFunction = (a: HierarchyPointNode<TreeNodeDatum>) => void;
type HighlightPathFunction = (
  rd3tNode: TreeNode,
  evt: React.MouseEvent,
  orientation: Orientation
) => void;
type RemoveHighlightPathFunction = (evt: React.MouseEvent) => void;
type SetLoadedFunction = (a: boolean) => void;
type OnNodeClickFunction = (
  a: HierarchyPointNode<TreeNodeDatum>,
  event: React.MouseEvent
) => void;
type SetNodeClickFunction = (func: OnNodeClickFunction) => void;

export type ProviderValue = {
  treeState: Partial<TreeProps>; // since you know this is what the provider will be passing
  selectedNode?: TreeHierarchyNode;
  loaded: boolean;
  setLoaded: SetLoadedFunction;
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
  dimensions?: Dimension; // dimensions can be optional if it might not be set initially
  setTranslate: (newTranslate: Point) => void;
}

export const TreeContext = createContext<ContextValue>(undefined);

const clickEvent = new MouseEvent("click", {
  view: window,
  bubbles: true,
  cancelable: true,
});

export const TreeProvider = ({
  children,
  dimensions,
  translate,
  setTranslate,
  settings,
}: TreeProviderProps) => {
  const [loaded, setLoaded] = useState(false);
  const { messageToSend } = useChrome();
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
    dimensions: dimensions,
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
      if (settings.pathFunc === "step") {
        classes += "link--crisp-edges ";
      }
      classes += !target.children ? "link__to-leaf" : "link__to-branch";

      return classes;
    },
  });

  useEffect(() => {
    // signal to content script react is ready to accept data
    messageToSend({
      action: MessageContent.checkDocStatus,
      target: MessageTarget.Sidepanel,
    });
  }, []);

  useEffect(() => {
    if (treeRef.current instanceof Tree) {
      const tElement = document.getElementsByClassName(
        treeRef.current.gInstanceRef
      )[0] as SVGElement;
      setTreeElement(tElement);
    } else {
      setLoaded(false);
    }
  }, [treeRef.current, setLoaded]);

  const updateTreeState = async (
    newState: Partial<TreeProps>,
    isNewTree: boolean = false
  ) => {
    setTreeState((prevState) => ({
      ...prevState,
      ...newState,
      dataKey: isNewTree ? `tree-${Date.now()}` : prevState.dataKey,
    }));
  };

  const updateSelectedNode = (newState: HierarchyPointNode<TreeNodeDatum>) => {
    setSelectedNode(newState);
  };

  useEffect(() => {
    if (loaded) {
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
    }
  }, [settings.orientation, translate, loaded]);

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
      console.group(message.action);
      console.log(
        "handling message",

        message.action
      );

      if (message.target === MessageTarget.Runtime) {
        if (message.action === MessageContent.updateGenTree) {
          const r3dtNodes = await genTreeData(message.data);
          await updateTreeState({ data: r3dtNodes }, true);
          setLoaded(true);
          setShouldDispatchClick(true);
        }
      }
      console.groupEnd();
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [updateTreeState, setLoaded, setShouldDispatchClick]);

  function getTreeElement(): SVGElement {
    if (!treeRef.current) {
      throw new Error("RefErr"); // throw keyword is used here
    }
    return document.getElementsByClassName(
      treeRef.current.gInstanceRef
    )[0] as SVGElement;
  }

  function getRootElementFromTree(): SVGElement {
    return getTreeElement().getElementsByTagName("g")[0] as SVGElement;
  }

  function getRootForeignObject(): SVGElement {
    return getRootElementFromTree().getElementsByTagName("foreignObject")[0];
  }

  function highlightSelectedPath(paths, selectedChildIndex): Element {
    const selectedPath = paths[selectedChildIndex];
    if (selectedPath) {
      selectedPath.id = "current-path";
      selectedPath.classList.add("highlight");
    }
    return selectedPath;
  }

  function selectNodeDescendantPaths(): Element[] {
    if (!(treeElement instanceof SVGElement)) {
      throw new Error("TreeReferenceError");
    }

    const selectedNodeChildCount = selectedNode.data.children.length;
    // Retrieve the last 'selectedNodeChildCount' number of link paths
    const linkPaths = Array.from(
      treeElement.querySelectorAll("path.rd3t-link")
    );
    const relevantPaths = linkPaths.slice(-selectedNodeChildCount);
    return relevantPaths;
  }

  function removeDescendantPathStyles(): Element[] {
    const paths = selectNodeDescendantPaths();
    paths.forEach((path) => {
      path.classList.remove("highlight");
      path.classList.add("current-paths");
      path.removeAttribute("id");
    });
    return paths;
  }

  const highlightPathToNode = (rd3tNode, evt, orientation): boolean => {
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
    return true;
  };

  const removeHighlightPathToNode = (evt): void => {
    try {
      removeDescendantPathStyles();
    } catch (e) {
      throw new Error("DomErr");
    }
    evt.stopPropagation();
  };

  const value = {
    highlightPathToNode,
    loaded,
    onNodeClick,
    removeHighlightPathToNode,
    selectedNode,
    setLoaded,
    setOnNodeClick,
    treeRef,
    treeState,
    updateSelectedNode,
    updateTreeState,
  };

  return (
    <TreeContext.Provider
      value={{
        highlightPathToNode: value.highlightPathToNode,
        loaded: value.loaded,
        onNodeClick: value.onNodeClick,
        removeHighlightPathToNode: value.removeHighlightPathToNode,
        selectedNode: value.selectedNode,
        setLoaded: value.setLoaded,
        setOnNodeClick: value.setOnNodeClick,
        treeRef: value.treeRef as unknown as
          | React.LegacyRef<SVGElement>
          | undefined,
        treeState: value.treeState,
        updateSelectedNode: value.updateSelectedNode as UpdateNodeFunction,
        updateTreeState: value.updateTreeState,
      }}
    >
      {children}
    </TreeContext.Provider>
  );
};
