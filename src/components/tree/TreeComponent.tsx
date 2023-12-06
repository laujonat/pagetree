import { forwardRef, Ref, useEffect, useRef, useState } from "react";
import { Tree } from "react-d3-tree";

import { useTree } from "@/hooks/useTree";
import { TreeComponentRef } from "@/types";

interface TreeComponentProps {}

export const TreeComponent = forwardRef<TreeComponentRef, TreeComponentProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_props: TreeComponentProps, parentRef) => {
    const { loaded, treeState, isExpanded, updateTreeRef } = useTree();
    const [nodeCount, setNodeCount] = useState<number>(0);
    const treeRef1 = useRef<Ref<Tree>>();
    const treeRef2 = useRef<Ref<Tree>>();

    useEffect(() => {
      const currentRef = isExpanded ? treeRef2.current : treeRef1.current;
      updateTreeRef(currentRef as Ref<Tree>);
    }, [isExpanded]);

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
      <span className="loading">Loading..</span>
    ) : (
      <article className="container">
        <strong className="nodelen__text">
          Total Element Node in Tree: {nodeCount}
        </strong>
        {!isExpanded && (
          <Tree ref={treeRef1 as Ref<Tree>} {...treeState} initialDepth={1} />
        )}
        {isExpanded && (
          <Tree
            ref={treeRef2 as Ref<Tree>}
            {...treeState}
            initialDepth={undefined}
          />
        )}
      </article>
    );
  }
);
