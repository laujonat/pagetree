import { useEffect, useId, useRef } from "react";
import { Orientation } from "react-d3-tree";

import useDraggable from "../../hooks/useDraggable";
import { useThrottle } from "../../hooks/useThrottle";
import { useTree } from "../../hooks/useTree";
import { TreeHierarchyNode, TreeNode } from "../../types";
import { sanitizeId } from "../../utils/treeutils";
import { TreeActionsToolbar } from "../tree/TreeActionsToolbar";

const clickEvent = new MouseEvent("click", {
  view: window,
  bubbles: true,
  cancelable: true,
});

export const DevToolsElement = (props: TreeNode) => {
  const { attrs, children, name } = props;
  const elementStyle = {
    color: "var(--webkit-tag-name)",
  };
  const key = useId();
  const renderAttributes = () => {
    return Object.entries(attrs)?.map(([attrName, attrValue], idx) => (
      <span key={idx}>
        <span style={{ color: "var(--webkit-tag-attribute-key)" }}>
          &nbsp;
          {attrName}
        </span>
        <span
          style={{ color: "var(--webkit-tag-attribute-value)" }}
        >{`="${attrValue}"`}</span>
      </span>
    ));
  };

  const expandElement = (): JSX.Element => {
    return (
      <span className="expand-button">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </span>
    );
  };

  return (
    <div style={elementStyle} className="webkit-element" key={key}>
      <code style={{ color: "var(--webkit-tag-name)" }}>{`<${name}`}</code>
      {renderAttributes()}
      <code style={{ color: "var(--webkit-tag-name)" }}>
        {`>`}
        <span className="children-placeholder">
          {children?.length ? expandElement() : ""}
        </span>
        {`</${name}>`}
      </code>
    </div>
  );
};

function DetailsItem(props) {
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

function DetailsPanel() {
  const { selectedNode } = useTree();
  const elementContainer = useRef(null);
  useDraggable(elementContainer);
  useEffect(() => {
    console.log("selectedNode from details panel", selectedNode);
  }, [selectedNode]);

  const renderChildren = (children) => {
    return children.map((child, idx) => <DetailsItem {...child} key={idx} />);
  };

  return (
    <>
      <TreeActionsToolbar
        ref={elementContainer}
        selectedNode={selectedNode as TreeHierarchyNode}
      />
      <div className="details__wrapper">
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
      </div>
    </>
  );
}

export default DetailsPanel;
