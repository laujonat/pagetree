import { useId } from "react";
import { Orientation } from "react-d3-tree";

import { useThrottle } from "../../hooks/useThrottle";
import { useTree } from "../../hooks/useTree";
import { TreeNode } from "../../types";
import { sanitizeId } from "../../utils/paths";

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

  const handleClick = () => {
    if (props.__rd3t.id) {
      // Find the foreignObject by its ID and trigger a click event
      const selector = `#${sanitizeId(props.__rd3t.id)} foreignObject`;
      const foreignObject = document.querySelector(String(selector));
      const clickEvent = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      // Dispatch it on the foreignObject
      if (foreignObject) {
        foreignObject.dispatchEvent(clickEvent);
      }
    }
  };

  const throttledHighlightPathToNode = useThrottle(highlightPathToNode, 500);

  const { orientation } = treeState;

  return (
    <li
      role="button"
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
            Jump
          </div>
          <div className="slider-rotate__button">Skip</div>
        </div>
      </div>
    </li>
  );
}

function DetailsPanel() {
  const { selectedNode } = useTree();

  const renderChildren = (children) => {
    return children.map((child, idx) => <DetailsItem {...child} key={idx} />);
  };

  return (
    <div className="details__wrapper">
      <div className="details__header">
        <div className="details__article">Children</div>
      </div>
      <section id="details">
        <ul className="details__list">
          {selectedNode?.data?.children &&
            renderChildren(selectedNode.data?.children)}
        </ul>
      </section>
    </div>
  );
}

export default DetailsPanel;
