import { forwardRef, Ref, useEffect, useRef } from "react";
import { Tree } from "react-d3-tree";

import { useTree } from "@/hooks/useTree";
import { TreeComponentRef } from "@/types";

interface TreeComponentProps {}

export const TreeComponent = forwardRef<TreeComponentRef, TreeComponentProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_props: TreeComponentProps, parentRef) => {
    const { loaded, treeState, isExpanded, updateTreeRef } = useTree();
    const treeRef1 = useRef<Ref<Tree>>();
    const treeRef2 = useRef<Ref<Tree>>();

    useEffect(() => {
      const currentRef = isExpanded ? treeRef2.current : treeRef1.current;
      updateTreeRef(currentRef as Ref<Tree>);
    }, [isExpanded]);

    return !loaded ? (
      <span className="loading">Loading..</span>
    ) : (
      <section className="container">
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
      </section>
    );
  }
);
