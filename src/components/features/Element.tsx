import { useRef } from "react";
import { TreeNodeDatum } from "react-d3-tree";

import { useDraggable } from "@/hooks/useDraggable";
import { TreeNode } from "@/types";

export const DevToolsElement = (props: TreeNodeDatum & TreeNode) => {
  const { attrs, children, name } = props;
  const elementStyle = {
    color: "var(--webkit-tag-name)",
    overflow: "auto", // Ensure that the container is scrollable
    maxHeight: "200px", // Adjust the max height as needed
  };
  const elementContainer = useRef(null);
  useDraggable(elementContainer);

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
    <div style={elementStyle} className="webkit-element">
      <div ref={elementContainer}>
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
    </div>
  );
};
