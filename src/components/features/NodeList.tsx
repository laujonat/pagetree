import { HierarchyPointNode } from "d3";
import { TreeNodeDatum } from "react-d3-tree";

import { ParentNode } from "@/icons";
import { nodeClickEvent } from "@/utils/event";
import { sanitizeId } from "@/utils/genTreePathsHelper";

import { NodeListItem } from "./NodeListItem";

interface NodeListProps {
  selectedNode?: Partial<HierarchyPointNode<TreeNodeDatum>>;
  isNodeListEmpty?: boolean;
}

export function NodeList(props: NodeListProps) {
  const { selectedNode, isNodeListEmpty } = props;

  function getForeignObjectElement(id: string): SVGElement {
    const selector = `#${sanitizeId(id)} foreignObject`;
    const foreignObject = document.querySelector(String(selector));
    if (!foreignObject) throw new Error("SvgElementQueryErr..");
    return foreignObject as SVGElement;
  }

  const handleParentClick = () => {
    if (selectedNode?.parent) {
      if (selectedNode.parent.data.__rd3t.id) {
        const fObjElement: SVGElement = getForeignObjectElement(
          selectedNode.parent.data.__rd3t.id
        );
        fObjElement.dispatchEvent(nodeClickEvent);
      }
    }
  };

  const renderChildren = (children) => {
    return children.map((child, idx) => {
      if (child) {
        // console.log("renderchildren child", child);
        return <NodeListItem node={child} key={idx} />;
      }
    });
  };

  return (
    <>
      <div className="nodelist__header">
        <div className="nodelist__article-wrapper">
          <div className="nodelist__article">
            <div>Child Elements</div>
            {selectedNode?.data?.children && (
              <div>
                <span>
                  &#40;{(selectedNode?.data?.children as []).length}&#41;
                </span>
              </div>
            )}
          </div>
          {selectedNode?.parent && (
            <div className="tree-actions pnode">
              <div className="tree-actions__left">
                <div className="tree-actions__action pnode">
                  <button aria-label="Visit parent" onClick={handleParentClick}>
                    <ParentNode />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <section
        id="details"
        style={{ pointerEvents: isNodeListEmpty ? "none" : "auto" }}
      >
        <ul className="details__list">
          {selectedNode?.children && renderChildren(selectedNode.children)}
        </ul>
      </section>
    </>
  );
}
