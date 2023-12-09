import { useId } from "react";
import { Orientation, TreeNodeDatum } from "react-d3-tree";

import { useThrottle } from "@/hooks/useThrottle";
import { useTree } from "@/hooks/useTree";
import { PageTreeHierarchyNode } from "@/types";
import { sanitizeId } from "@/utils/treepath";

import { DevToolsElement } from "./Element";

const clickEvent = new MouseEvent("click", {
  view: window,
  bubbles: true,
  cancelable: true,
});

interface NodeListItemProps {
  node: PageTreeHierarchyNode<TreeNodeDatum>;
}

export function NodeListItem(props: NodeListItemProps) {
  const { highlightPathToNode, removeHighlightPathToNode, treeState } =
    useTree();
  const id = useId();
  const { node } = props;

  function getForeignObjectElement(id: string): SVGElement {
    const selector = `#${sanitizeId(id)} foreignObject`;
    const foreignObject = document.querySelector(String(selector));
    if (!foreignObject) throw new Error("SvgElementQueryErr..");
    return foreignObject as SVGElement;
  }

  const handleVisitClick = () => {
    if (node.data.__rd3t.id) {
      const fObjElement: SVGElement = getForeignObjectElement(
        node.data.__rd3t.id
      );
      fObjElement.dispatchEvent(clickEvent);
    }
  };

  const throttledHighlightPathToNode = useThrottle(highlightPathToNode, 500);

  const { orientation } = treeState;

  return (
    <li
      role="button"
      key={id}
      tabIndex={0}
      className="details__item"
      onMouseEnter={async (evt) =>
        await throttledHighlightPathToNode(
          node.data,
          evt,
          orientation as Orientation
        )
      }
      onMouseOut={removeHighlightPathToNode}
    >
      <DevToolsElement {...node.data} />
      <div className="slider-rotate">
        <div className="slider-rotate__selector">
          <div className="slider-rotate__button" onClick={handleVisitClick}>
            Visit
          </div>
          {/* <div
            className="slider-rotate__button"
            onClick={() => expandChildNodes(node.data.__rd3t.id)}
          >
            Expand
          </div> */}
        </div>
      </div>
    </li>
  );
}
