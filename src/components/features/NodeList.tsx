import { TreeHierarchyNode } from "@/types";

import { NodeListItem } from "./NodeListItem";

interface NodeListProps {
  selectedNode?: TreeHierarchyNode;
}

export function NodeList(props: NodeListProps) {
  const { selectedNode } = props;
  const renderChildren = (children) => {
    return children.map((child, idx) => <NodeListItem {...child} key={idx} />);
  };

  return (
    <>
      <div className="details__header">
        <div className="details__article">
          <div>Child Elements</div>
          {selectedNode?.data?.children && (
            <div>
              <b>&#40;{(selectedNode?.data?.children as []).length}&#41;</b>
            </div>
          )}
        </div>
      </div>
      <section id="details">
        <ul className="details__list">
          {selectedNode?.data?.children &&
            renderChildren(selectedNode.data?.children)}
        </ul>
      </section>
    </>
  );
}
