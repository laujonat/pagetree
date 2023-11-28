import { select } from "d3";
import { forwardRef, Ref, useEffect, useState } from "react";
import Tree from "react-d3-tree";

import { useTree } from "../../hooks/useTree";

interface TreeComponentProps {}

export const TreeComponent = forwardRef<SVGElement, TreeComponentProps>(
  (_props: TreeComponentProps, ref) => {
    const { loaded, treeState } = useTree();
    const [nodeCount, setNodeCount] = useState<number>(0);

    useEffect(() => {
      function countNodes(count: number = 0, node) {
        count += 1;
        if (!node.children) {
          return count;
        }

        return node.children.reduce(
          (sum, child) => countNodes(sum, child),
          count
        );
      }
      const len = countNodes(
        0,
        Array.isArray(treeState.data) ? treeState.data[0] : treeState.data
      );
      setNodeCount(len);
    }, [treeState.data]);

    return !loaded ? (
      <h1 className="loading">Loading..</h1>
    ) : (
      <>
        <strong className="nodelen__text">
          Total Element Node in Tree: {nodeCount}
        </strong>
        <Tree
          ref={ref as Ref<Tree>}
          {...treeState}
          onNodeMouseOver={mouseover}
          onNodeMouseOut={mouseout}
        />
      </>
    );
  }
);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mouseover(d: any) {
  // @ts-ignore ignore
  select(this)
    .append("text")
    .attr("class", "hover")
    .attr("transform", function (d) {
      return "translate(5, -10)";
    })
    .text(d.name + ": " + d.id);
}

// Toggle children on click.
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
function mouseout(_d) {
  // @ts-ignore ignore
  select(this).select("text.hover").remove();
}
