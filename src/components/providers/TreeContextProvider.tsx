import {
  createContext,
  LegacyRef,
  Ref,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Orientation,
  Point,
  Tree,
  TreeNodeDatum,
  TreeProps,
} from "react-d3-tree";

import { MessageContent, MessageTarget } from "@/constants";
import useChrome from "@/hooks/useChrome";
import { useData } from "@/hooks/useData";
import { Dimension, ISettings, PageTreeHierarchyNode, TreeNode } from "@/types";
import { findNodesById, genTreeData, getDefaultZoom } from "@/utils/treenode";
import {
  renderForeignObjectNode,
  sortPaths,
  updateCurrentNode,
} from "@/utils/treepath";

type UpdateTreeFunction = (a: Partial<TreeProps>) => void;
type UpdateNodeFunction = (a: PageTreeHierarchyNode<TreeNodeDatum>) => void;
type UpdateTreeRef = (e: Ref<Tree>) => void;
type HighlightPathFunction = (
  rd3tNode: TreeNode,
  evt: MouseEvent,
  orientation: Orientation
) => void;

type RemoveHighlightPathFunction = (evt: MouseEvent) => void;
type SetLoadedFunction = (a: boolean) => void;
type HandleExpandFunction = (e: React.MouseEvent) => void;
type HandleExpandChildrenFunction = (node: string) => void;
type OnNodeClickFunction = (
  a: PageTreeHierarchyNode<TreeNodeDatum>,
  event: React.MouseEvent
) => void;
type SetNodeClickFunction = (func: OnNodeClickFunction) => void;

export type ProviderValue = {
  expandAllNodes: HandleExpandFunction;
  expandChildNodes: HandleExpandChildrenFunction;
  highlightPathToNode: HighlightPathFunction;
  isExpanded: boolean;
  loaded: boolean;
  nodeCount: number;
  onNodeClick: OnNodeClickFunction;
  removeHighlightPathToNode: RemoveHighlightPathFunction;
  selectedNode?: PageTreeHierarchyNode<TreeNodeDatum>;
  setLoaded: SetLoadedFunction;
  setOnNodeClick: SetNodeClickFunction;
  treeRef: LegacyRef<SVGElement> | undefined;
  treeState: Partial<TreeProps>; // since you know this is what the provider will be passing
  updateSelectedNode: UpdateNodeFunction;
  updateTreeRef: UpdateTreeRef;
  updateTreeState: UpdateTreeFunction;
};

export type DefaultValue = undefined;

export type ContextValue = DefaultValue | ProviderValue;

export interface TreeProviderProps {
  children: React.ReactNode;
  settings: ISettings;
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
  const { messageToSend, tabId } = useChrome();
  const [expandNodes, setExpandNodes] = useState(false);
  const [nodeCount, setNodeCount] = useState<number>(0);
  const [shouldDispatchClick, setShouldDispatchClick] = useState(false);
  const [selectedNode, setSelectedNode] =
    useState<PageTreeHierarchyNode<TreeNodeDatum>>();
  const treeRef = useRef<Tree>();

  const [onNodeClick, setOnNodeClick] = useState<OnNodeClickFunction>(
    () => () => {}
  );
  const [treeElement, setTreeElement] = useState<Element>();
  const [state, setProperty] = useData({
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
    scaleExtent: { max: 10, min: 0.01 },
    separation: { siblings: 1, nonSiblings: 0.75 },
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
    onNodeClick: async (...args) => {
      const [node] = args;
      try {
        await updateSelectedNode(node);
        setOnNodeClick(async () => {
          await updateSelectedNode(node);
        });
      } catch (error) {
        console.error(error);
      }
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
    const handleMessage = async (message) => {
      try {
        if (message.target === MessageTarget.Runtime) {
          if (message.action === MessageContent.updateGenTree) {
            const r3dtNodes = await genTreeData(message.data);
            await updateTreeState({ data: r3dtNodes }, true);
            setShouldDispatchClick(true);
            setLoaded(true);
          }
        }
      } catch (error) {
        console.error(error);
        console.trace(error);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [updateTreeState, setLoaded, setShouldDispatchClick]);

  useEffect(() => {
    if (Object.hasOwn(state.data, "children")) {
      const len = countNodes(
        0,
        Array.isArray(state.data) ? state.data[0] : state.data
      );
      setNodeCount(len);
    }
  }, [state.data]);

  useEffect(() => {
    // signal to content script react is ready to accept data
    if (tabId) {
      messageToSend({
        action: MessageContent.checkDocStatus,
        target: MessageTarget.Sidepanel,
      });
    }
  }, [tabId]);

  useEffect(() => {
    if (Object.hasOwn(state.data, "children")) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }, [state.data, treeElement]);

  useEffect(() => {
    if (treeRef.current instanceof Tree) {
      const tElement = document.getElementsByClassName(
        treeRef.current.gInstanceRef
      )[0] as SVGElement;
      setTreeElement(tElement);
    }
  }, [treeRef.current, setTreeElement]);

  useEffect(() => {
    if (loaded) {
      setProperty("orientation", settings.orientation);
      setProperty(
        "separation",
        settings.orientation === "vertical"
          ? { siblings: 1, nonSiblings: 1.5 }
          : { siblings: 0.5, nonSiblings: 0 }
      );
      setProperty("dimensions", {
        width: translate.x * 2,
        height: translate.y * 2,
      });
      setProperty("translate", translate);
      setProperty("zoom", 1.5);
    }
  }, [settings.orientation, translate, loaded]);

  useEffect(() => {
    setProperty("orientation", settings.orientation);
    setProperty("pathFunc", settings.pathFunc);
    setProperty(
      "shouldCollapseNeighborNodes",
      settings.shouldCollapseNeighborNodes
    );
    setProperty("orientation", settings.orientation);
  }, [settings]);

  useEffect(() => {
    if (!expandNodes) {
      if (shouldDispatchClick && treeRef.current) {
        getRootForeignObject().dispatchEvent(clickEvent);
        setShouldDispatchClick(false); // Reset the flag
      }
    }
  }, [state.data, shouldDispatchClick, expandNodes]); // Run when tree data or shouldDispatchClick changes

  function countNodes(count: number = 0, node) {
    count += 1;
    if (!children) {
      return count;
    }

    return node.children.reduce((sum, child) => countNodes(sum, child), count);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const expandAllNodes = (_e) => {
    setExpandNodes(!expandNodes);
    if (!expandNodes) {
      setProperty("zoom", getDefaultZoom(nodeCount));
    } else {
      setProperty("zoom", 1.5);
    }
  };

  const updateTreeRef = (ref) => {
    treeRef.current = ref;
  };

  async function updateTreeState(
    newState: Partial<TreeProps>,
    isNewTree: boolean = false
  ) {
    for (const key in newState) {
      if (Object.prototype.hasOwnProperty.call(newState, key)) {
        setProperty(key as keyof TreeProps, newState[key]); // Use setProperty to update each property in newState
      }
    }

    setProperty("dataKey", isNewTree ? `tree-${Date.now()}` : state.dataKey); // Update 'dataKey' separately if needed
  }

  const expandChildNodes = async (node: string) => {
    console.log("here", node, selectedNode);
    if (selectedNode?.children) {
      const hits = findNodesById(node, selectedNode.children, [])[0];
      // @ts-ignore wip
      const result = await expandNodeDescendants(hits.data);
      console.log("expand result", result);
      console.log("node", selectedNode);
    }
  };

  async function updateSelectedNode(
    newState: PageTreeHierarchyNode<TreeNodeDatum>
  ) {
    await setSelectedNode(newState);
  }

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
    if (selectedNode?.data && selectedNode?.data.children) {
      const selectedNodeChildCount = selectedNode.data.children.length;
      // Retrieve the last 'selectedNodeChildCount' number of link paths
      const linkPaths = Array.from(
        treeElement.querySelectorAll("path.rd3t-link")
      );
      const relevantPaths = linkPaths.slice(-selectedNodeChildCount);
      return relevantPaths;
    }
    return [];
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
    console.log("highlightpathtonode", evt);
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
    nodeCount,
    expandNodes,
    expandAllNodes,
    expandChildNodes,
    highlightPathToNode,
    loaded,
    onNodeClick,
    removeHighlightPathToNode,
    selectedNode,
    setLoaded,
    setOnNodeClick,
    treeRef,
    treeState: state,
    updateSelectedNode,
    updateTreeRef,
    updateTreeState,
  };

  return (
    <TreeContext.Provider
      value={{
        isExpanded: value.expandNodes,
        expandAllNodes: value.expandAllNodes,
        expandChildNodes: value.expandChildNodes,
        highlightPathToNode: value.highlightPathToNode,
        loaded: value.loaded,
        onNodeClick: value.onNodeClick,
        nodeCount: value.nodeCount,
        removeHighlightPathToNode: value.removeHighlightPathToNode,
        selectedNode: value.selectedNode,
        setLoaded: value.setLoaded,
        setOnNodeClick: value.setOnNodeClick,
        treeRef: value.treeRef as unknown as
          | React.LegacyRef<SVGElement>
          | undefined,
        treeState: value.treeState,
        updateSelectedNode: value.updateSelectedNode,
        updateTreeRef: value.updateTreeRef,
        updateTreeState: value.updateTreeState,
      }}
    >
      {children}
    </TreeContext.Provider>
  );
};
