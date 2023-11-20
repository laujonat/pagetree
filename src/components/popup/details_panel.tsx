import { useRef } from "react";

import useDraggable from "../../hooks/useDraggable";
import { useTree } from "../../hooks/useTree";

export const DevToolsElement = ({ name, attrs, children }) => {
  const elementStyle = {
    color: "var(--webkit-tag-name)",
  };
  const elementContainer = useRef(null);
  useDraggable(elementContainer);

  const renderAttributes = () => {
    return Object.entries(attrs)?.map(([attrName, attrValue]) => (
      <span key={attrName}>
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

  const expandElement = () => {
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
      <div className="webkit-element__scrollable" ref={elementContainer}>
        <span style={{ color: "var(--webkit-tag-name)" }}>{`<${name}`}</span>
        {renderAttributes()}
        <span style={{ color: "var(--webkit-tag-name)" }}>
          {`>`}
          <span className="children-placeholder">
            {children.length ? expandElement() : ""}
          </span>
          {`</${name}>`}
        </span>
      </div>
    </div>
  );
};

function DetailsPanel() {
  const { selectedNode } = useTree();
  const children = selectedNode.data?.children.length;
  const elementContainer = useRef(null);
  useDraggable(elementContainer);
  return (
    <div className="details__wrapper">
      {/* {JSON.stringify(selectedNode.data)} */}
      <section id="details" ref={elementContainer}>
        {selectedNode.data?.attributes && (
          <DevToolsElement
            {...selectedNode.data}
            // node={selectedNode.data}
            // name={selectedNode.data.name}
          />
        )}
        {/* {children && (
          <sub id="details__children-count">
            <span>Number of Children: </span>
            <span id="childrenCount">{selectedNode.data.children.length}</span>
          </sub>
        )} */}
      </section>
    </div>
  );
}

export default DetailsPanel;
