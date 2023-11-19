import React, { useEffect, useRef } from "react";
import { Tree } from "react-d3-tree";

import { useTree } from "../../hooks/useTree";

const TreeView = ({ orientation, updateOrientation }) => {
  const { treeState, loaded, updateTreeState } = useTree();
  const foreignObjectProps = { width: 50, height: 50, x: -25, y: -30 };
  const handleNodeClick = (nodeDatum) => {
    console.log(nodeDatum);

    window.alert(
      nodeDatum.children ? "Clicked a branch node" : "Clicked a leaf node."
    );
  };
  const currentNode = useRef<HTMLElement | null>(null);

  useEffect(() => {
    console.log(orientation);
    updateTreeState({ orientation });
  }, [orientation]);

  const renderForeignObjectNode = (rd3tProps) => {
    const { nodeDatum, toggleNode, foreignObjectProps, handleNodeClick } =
      rd3tProps;

    return (
      <>
        <circle
          onClick={(e) => {
            e.preventDefault();
          }}
          onMouseOver={(e) => {
            e.preventDefault();
          }}
          //   onClick={() => handleNodeClick(nodeDatum)}
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
          onClick={(e) => {
            e.preventDefault();
            toggleNode(nodeDatum);
            rd3tProps.onNodeClick(e);
          }}
          onMouseOver={(e) => {
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
    // console.log("source", source);
    // console.log("target", target);

    const previouslySelected = document.querySelectorAll(".link__selected");
    previouslySelected.forEach((el) => el.classList.remove("link__selected"));

    // Function to add class to a node element
    const addClassToNodeElement = (node) => {
      if (node && !node.data.__rd3t.collapsed) {
        const element = document.getElementById(
          node.data.__rd3t.id
        )?.firstElementChild;
        if (element instanceof SVGElement) {
          element.classList.add("link__selected");
        }
      }
    };

    // Add 'link__selected' class to source and target nodes
    addClassToNodeElement(source);
    addClassToNodeElement(target);
  };

  const getDynamicPathClass = ({ source, target }, orientation) => {
    // console.info("I am the source", source);
    // console.info("I am the target", target);

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
      <div className="tree-toolbar">
        <div className="tree-toolbar__left">
          <div className="tree-toolbar__label">Orientation</div>
          <div className="tree-toolbar__selector">
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
        <div
          style={{ width: "100%", height: "80vh" }}
          id="treeWrapper"
          className="tree-container"
        >
          <Tree
            {...treeState}
            renderCustomNodeElement={(rd3tProps) =>
              renderForeignObjectNode({
                ...rd3tProps,
                foreignObjectProps,
                handleNodeClick,
              })
            }
            onNodeClick={(...args) => {
              console.log("onnodeclick", args);
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
              //   console.log("onLinkMouseOver", args);
            }}
            onLinkMouseOut={(...args) => {
              //   console.log("onLinkMouseOut", args);
            }}
            pathFunc="step"
            pathClassFunc={getDynamicPathClass}
          />
        </div>
      )}
    </section>
  );
};

export default TreeView;
