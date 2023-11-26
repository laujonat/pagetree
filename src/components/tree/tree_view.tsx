import { LegacyRef, useEffect, useRef, useState } from "react";
import { Tree, TreeNodeDatum } from "react-d3-tree";

import useDraggable from "../../hooks/useDraggable";
import { useTree } from "../../hooks/useTree";
import { DevToolsElement } from "../popup/details_panel";

const TreeView = ({ orientation, updateOrientation }) => {
  const {
    loaded,
    selectedNode,
    treeRef,
    treeState,
    setOnNodeClick,
    updateSelectedNode,
    updateTreeState,
  } = useTree();
  const foreignObjectProps = { width: 50, height: 50, x: -25, y: -30 };
  const [ref, setRef] = useState<LegacyRef<Tree> | undefined>();
  useEffect(() => {
    setRef(treeRef);
  }, []);

  const elementContainer = useRef(null);
  useDraggable(elementContainer);

  useEffect(() => {
    updateTreeState({ orientation });
  }, [orientation]);
  useEffect(() => {
    console.log("treestate", treeState);
  }, [treeState]);

  const renderForeignObjectNode = (rd3tProps) => {
    const { nodeDatum, toggleNode, foreignObjectProps, onNodeClick } =
      rd3tProps;

    function collapseNode(node: TreeNodeDatum) {
      console.log("collapse", node);
      node.__rd3t.collapsed = true;
      //   node.__rd3t.collapsed = false;
      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => {
          // If the child is not already collapsed, collapse it
          if (!child.__rd3t.collapsed) {
            console.log("child collapse", child);
            Tree.collapseNode(child);

            // child.__rd3t.collapsed = true; // Collapse this child
            // toggleNode(child);
            collapseNode(child); // Recursively collapse its children
            // toggleNode(child);
          }
        });
      }
    }

    const handleClick = (evt) => {
      evt.preventDefault();
      if (!nodeDatum.__rd3t.collapsed) {
        Tree.expandNode(nodeDatum);
      } else {
        toggleNode(nodeDatum);
      }
      collapseNode(nodeDatum);
      onNodeClick(evt); // Pass nodeDatum to the onNodeClick
      Tree.expandNode(nodeDatum);
    };

    return (
      <>
        <circle
          onMouseOver={(e) => {
            e.preventDefault();
          }}
          cursor="pointer"
          r={5}
          stroke={
            nodeDatum.children.length > 0
              ? "var(--node-border)"
              : "var(--text-color-light)"
          }
          fill={nodeDatum.children.length > 0 ? "var(--node)" : "var(--leaf)"}
        ></circle>
        <foreignObject
          {...foreignObjectProps}
          style={{ overflow: "hidden", margin: "0 auto" }}
          onClick={handleClick}
          onMouseEnter={(e) => {
            e.preventDefault();
            rd3tProps.onNodeMouseOver(e);
          }}
          onMouseDown={(e) => {
            e.preventDefault();
          }}
        >
          <div>
            <p className="tree__text">{`<${nodeDatum.name}>`}</p>
          </div>
        </foreignObject>
      </>
    );
  };

  const updateCurrentNode = (source, target) => {
    const previouslySelected = document.querySelectorAll(".link__selected");
    previouslySelected.forEach((el) => el.classList.remove("link__selected"));
    const addClassToNodeElement = (node) => {
      if (node && !node.data.__rd3t.collapsed) {
        const element = document.getElementById(node.data.__rd3t.id);
        if (element instanceof SVGElement) {
          element.classList.add("link__selected");
        }
      }
    };
    addClassToNodeElement(source);
    addClassToNodeElement(target);
  };

  const stepPathFunc = (linkDatum, orientation) => {
    const { source, target } = linkDatum;
    const deltaY = target.y - source.y;
    return orientation === "horizontal"
      ? `M${source.y},${source.x} H${source.y + deltaY / 2} V${target.x} H${
          target.y
        }`
      : `M${source.x},${source.y} V${source.y + deltaY / 2} H${target.x} V${
          target.y
        }`;
  };

  const getDynamicPathClass = ({ source, target }) => {
    updateCurrentNode(source, target);

    if (!target.children) {
      // Target node has no children -> this link leads to a leaf node.
      return "link__to-leaf";
    }

    // Style it as a link connecting two branch nodes by default.
    return "link__to-branch";
  };

  return (
    <section className="wrapper">
      <div>
        <div className="tree-selector">
          <div className="tree-selector__left">
            <div className="tree-selector__label">Element</div>
          </div>
          <div className="tree-selector__right">
            <div className="webkit-element__scrollable" ref={elementContainer}>
              {selectedNode?.data && <DevToolsElement {...selectedNode.data} />}
            </div>
          </div>
        </div>
        <div className="tree-toolbar">
          <div className="tree-toolbar__left">
            <div className="tree-toolbar__label">Orientation</div>
          </div>
          <div className="tree-toolbar__right">
            <div
              onClick={() => updateOrientation("horizontal")}
              role="button"
              className="button"
            >
              Horizontal
            </div>
            <div
              onClick={() => updateOrientation("vertical")}
              role="button"
              className="button"
            >
              Vertical
            </div>
          </div>
        </div>
      </div>
      {!loaded ? (
        <h1 className="loading">Loading..</h1>
      ) : (
        <Tree
          ref={ref}
          {...treeState}
          renderCustomNodeElement={(rd3tProps) =>
            renderForeignObjectNode({
              ...rd3tProps,
              foreignObjectProps,
            })
          }
          onNodeClick={(...args) => {
            const [node] = args;
            updateSelectedNode(node);
            setOnNodeClick(() => () => {
              updateSelectedNode(node);
            });
          }}
          onNodeMouseOver={(...args) => {
            console.log("onNodeMouseOver", args);
          }}
          onNodeMouseOut={(...args) => {
            console.log("onNodeMouseOut", args);
          }}
          onLinkClick={(e) => {
            console.log("onLinkClick", e);
          }}
          onLinkMouseOver={(...args) => {
            console.log("onLinkMouseOver", args);
          }}
          onLinkMouseOut={(...args) => {
            console.log("onLinkMouseOut", args);
          }}
          pathFunc={stepPathFunc}
          pathClassFunc={getDynamicPathClass}
        />
        // </div>
      )}
    </section>
  );
};

export default TreeView;
