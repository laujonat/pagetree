import { useId } from "react";
import { Orientation } from "react-d3-tree";

import { useThrottle } from "@/hooks/useThrottle";
import { useTree } from "@/hooks/useTree";
import { sanitizeId } from "@/utils/genTreePathsHelper";

import { DevToolsElement } from "./Element";

const clickEvent = new MouseEvent("click", {
  view: window,
  bubbles: true,
  cancelable: true,
});

export function NodeListItem(props) {
  const { highlightPathToNode, removeHighlightPathToNode, treeState } =
    useTree();
  const id = useId();

  function getForeignObjectElement(id: string): SVGElement {
    const selector = `#${sanitizeId(id)} foreignObject`;
    const foreignObject = document.querySelector(String(selector));
    if (!foreignObject) throw new Error("SvgElementQueryErr..");
    return foreignObject as SVGElement;
  }

  const handleClick = () => {
    if (props.__rd3t.id) {
      const fObjElement: SVGElement = getForeignObjectElement(props.__rd3t.id);
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
      onMouseEnter={(evt) =>
        throttledHighlightPathToNode(props, evt, orientation as Orientation)
      }
      onMouseLeave={removeHighlightPathToNode}
    >
      <DevToolsElement {...props} />
      <div className="slider-rotate">
        <div className="slider-rotate__selector">
          <div className="slider-rotate__button" onClick={handleClick}>
            Visit
          </div>
          <div className="slider-rotate__button">Expand</div>
        </div>
      </div>
    </li>
  );
}
