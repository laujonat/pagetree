import { forwardRef, Ref } from "react";
import Tree from "react-d3-tree";

import { useTree } from "../../hooks/useTree";

interface TreeComponentProps {}

export const TreeComponent = forwardRef<SVGElement, TreeComponentProps>(
  (_props: TreeComponentProps, ref) => {
    const { loaded, treeState } = useTree();

    return !loaded ? (
      <h1 className="loading">Loading..</h1>
    ) : (
      <Tree
        ref={ref as Ref<Tree>}
        {...treeState}
        // renderCustomNodeElement={(rd3tProps) =>
        //   renderForeignObjectNode({
        //     ...rd3tProps,
        //   })
        // }
        // onNodeClick={(...args) => {
        //   const [node] = args;
        //   updateSelectedNode(node);
        //   setOnNodeClick(() => () => {
        //     updateSelectedNode(node);
        //   });
        // }}
        // pathFunc="step"
        // pathClassFunc={({ source, target }) => {
        //   updateCurrentNode(source, target);
        //   if (!target.children) {
        //     return "link__to-leaf";
        //   }
        //   return "link__to-branch";
        // }}
      />
    );
  }
);
