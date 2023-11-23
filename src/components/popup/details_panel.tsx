import { useId } from "react";

import { useTree } from "../../hooks/useTree";
import { TreeNode } from "../../types";

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
      <span style={{ color: "var(--webkit-tag-name)" }}>{`<${name}`}</span>
      {renderAttributes()}
      <span style={{ color: "var(--webkit-tag-name)" }}>
        {`>`}
        <span className="children-placeholder">
          {children?.length ? expandElement() : ""}
        </span>
        {`</${name}>`}
      </span>
    </div>
  );
};

function DetailsItem(props) {
  const { highlightPathToNode, removeHighlightPathToNode } = useTree();
  return (
    <li
      className="details__item"
      onMouseEnter={(evt) => highlightPathToNode(props, evt)}
      onMouseLeave={removeHighlightPathToNode}
    >
      <DevToolsElement {...props} />
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
