import { useEffect, useState } from "react";
import { Tree, TreeProps } from "react-d3-tree";

import { convertToD3Format } from "../../parser";

function TreeView(props) {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [state, setState] = useState<TreeProps>({
    centeringTransitionDuration: 800,
    collapsible: true,
    data: [],
    depthFactor: undefined,
    dimensions: { width: props.w, height: props.h },
    draggable: true,
    enableLegacyTransitions: false,
    hasInteractiveNodes: true,
    initialDepth: 1,
    nodeSize: { x: 100, y: 100 },
    orientation: "horizontal",
    rootNodeClassName: "tree__root",
    branchNodeClassName: "tree__branch",
    leafNodeClassName: "tree__leaf",
    scaleExtent: { min: 0.25, max: 2 },
    separation: { siblings: 0.5, nonSiblings: 0 },
    shouldCollapseNeighborNodes: true,
    transitionDuration: 500,
    translate: { x: props.w, y: props.h },
    zoom: 1,
    zoomable: true,
  });

  const foreignObjectProps = { width: 50, height: 50, x: -25, y: -30 };
  const handleNodeClick = (evt, nodeDatum) => {
    evt.stopPropagation(); // Prevent event from bubbling up

    console.log(nodeDatum);
    // window.alert(
    //   nodeDatum.children ? "Clicked a branch node" : "Clicked a leaf node."
    // );
  };
  useEffect(() => {
    // if (containerRef.current) {
    console.log("dimensions", state.dimensions);
    console.log("translate", state.translate);
    // }
  }, []);

  useEffect(() => {
    console.log("tree view effect", props);
    async function generateAndSendMessage() {
      try {
        console.log(props.nodes);
        const r3dtNodes = await convertToD3Format(props.nodes);
        setState((prevState) => ({
          ...prevState,
          data: r3dtNodes,
        }));
        setLoaded(true);
      } catch (error) {
        console.error("Error generating tree:", error);
      }
    }
    generateAndSendMessage();
  }, [props.nodes]);
  const renderForeignObjectNode = (rd3tProps) => {
    const { nodeDatum, toggleNode, foreignObjectProps, handleNodeClick } =
      rd3tProps;
    // console.log(rd3tProps);

    return (
      <g
        onClick={toggleNode}
        onScroll={(e) => {
          console.log("e", e);
          e.stopPropagation();
        }}
      >
        <circle
          onClick={(evt) => handleNodeClick(evt, nodeDatum)}
          onMouseOver={() => rd3tProps.onNodeMouseOver(nodeDatum)}
          onMouseOut={() => rd3tProps.onNodeMouseOut(nodeDatum)}
          r={5}
          stroke={
            nodeDatum.children.length > 0
              ? "var(--node-border)"
              : "var(--text-color-light)"
          }
          fill={nodeDatum.children.length > 0 ? "var(--node)" : "var(--leaf)"}
        ></circle>
        <foreignObject {...foreignObjectProps} style={{ overflow: "visible" }}>
          <div>
            <p className="tree__text">{`<${nodeDatum.name}>`}</p>
          </div>
        </foreignObject>
      </g>
    );
  };
  const getDynamicPathClass = ({ source, target }, orientation) => {
    if (!target.children) {
      // Target node has no children -> this link leads to a leaf node.
      return "link__to-leaf";
    }

    // Style it as a link connecting two branch nodes by default.
    return "link__to-branch";
  };

  return (
    <section className="wrapper">
      {!loaded ? (
        <h1 className="loading">Loading..</h1>
      ) : (
        <div
          style={{ width: "100%", height: "80vh" }}
          id="treeWrapper"
          className="tree-container"
        >
          <Tree
            {...state}
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
              console.log("onLinkMouseOver", args);
            }}
            onLinkMouseOut={(...args) => {
              console.log("onLinkMouseOut", args);
            }}
            pathFunc="step"
            pathClassFunc={getDynamicPathClass}
          />
        </div>
      )}
    </section>
  );
}

export default TreeView;
