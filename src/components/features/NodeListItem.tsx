import { useId, useRef } from "react";
import { Orientation, TreeNodeDatum } from "react-d3-tree";

import { useThrottle } from "@/hooks/useThrottle";
import { useTree } from "@/hooks/useTree";
import { PageTreeHierarchyNode } from "@/types";
import { pathMouseEnterEvent, pathMouseOutEvent } from "@/utils/events";
import { getForeignObjectElement } from "@/utils/treepath";

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
  const liRef = useRef<HTMLLIElement | null>(null); // Add the correct type here
  const id = useId();
  const { node } = props;

  const triggerMouseEnter = (event) => {
    if (liRef.current && event.target === liRef.current) {
      liRef.current.dispatchEvent(pathMouseEnterEvent);
      throttledHighlightPathToNode(
        node.data,
        pathMouseEnterEvent,
        orientation as Orientation
      );
    }
    event.stopPropagation();
  };

  const triggerMouseOut = (event) => {
    if (liRef.current && event.target === liRef.current) {
      console.log("triggerMouseOut", event.currentTarget);
      console.log("triggerMouseOut", event.target);
      liRef.current.dispatchEvent(pathMouseOutEvent);
      removeHighlightPathToNode(pathMouseOutEvent);
    }
    event.stopPropagation();
  };

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
      ref={liRef}
      role="button"
      key={id}
      tabIndex={0}
      className="details__item"
      onMouseEnter={triggerMouseEnter}
      onMouseLeave={triggerMouseOut}
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
