import { forwardRef, Ref, useEffect, useRef, useState } from "react";

import { useDraggable } from "../../hooks/useDraggable";
import { useSettings } from "../../hooks/useSettings";
import { useTree } from "../../hooks/useTree";
import { TreeHierarchyNode } from "../../types";
import { DevToolsElement } from "../common/info";
import Tabs from "../common/tabs";
import { TreeComponent } from "./TreeComponent";
import { TreeSettings } from "./TreeSettings";

interface SelectedNodeInfoProps {
  selectedNode: TreeHierarchyNode;
}

const SelectedNodeInfo = forwardRef<HTMLDivElement, SelectedNodeInfoProps>(
  (props: SelectedNodeInfoProps, ref) => {
    const { selectedNode } = props;

    return (
      <div className="tree-selector">
        <div className="tree-selector__left">
          <button id="activateInspector">Inspect Element</button>
          <div className="tree-selector__label">
            <svg
              fill="var(--text-color)"
              height="24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
              stroke="var(--text-color)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m18.285 17.578 2.569 2.568a.5.5 0 0 1-.708.708l-2.568-2.57-1.662 2.493a.5.5 0 0 1-.884-.101l-3-8a.5.5 0 0 1 .644-.644l8 3a.5.5 0 0 1 .101.884zm-1.054-.5 2.18-1.453-6.057-2.27 2.271 6.055 1.453-2.179a.502.502 0 0 1 .153-.153zM5.5 3a.5.5 0 0 1 0 1A1.5 1.5 0 0 0 4 5.5a.5.5 0 0 1-1 0A2.5 2.5 0 0 1 5.5 3zm3 1a.5.5 0 0 1 0-1h2a.5.5 0 1 1 0 1zm5 0a.5.5 0 1 1 0-1h2a.5.5 0 1 1 0 1zm-5 17a.5.5 0 1 1 0-1h2a.5.5 0 1 1 0 1zM3 8.5a.5.5 0 0 1 1 0v2a.5.5 0 1 1-1 0zm0 5a.5.5 0 1 1 1 0v2a.5.5 0 1 1-1 0zm0 5a.5.5 0 1 1 1 0A1.5 1.5 0 0 0 5.5 20a.5.5 0 1 1 0 1A2.5 2.5 0 0 1 3 18.5zm18-8a.5.5 0 1 1-1 0v-2a.5.5 0 1 1 1 0zm0-5a.5.5 0 1 1-1 0A1.5 1.5 0 0 0 18.5 4a.5.5 0 1 1 0-1A2.5 2.5 0 0 1 21 5.5z" />
            </svg>
          </div>
          <div className="tree-selector__label">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              stroke="var(--text-color)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
              <path d="M15 6a9 9 0 0 0-9 9M18 15v6M21 18h-6" />
            </svg>
          </div>
        </div>
        <div className="tree-selector__right">
          <div className="webkit-element__scrollable" ref={ref}>
            {selectedNode?.data && <DevToolsElement {...selectedNode.data} />}
          </div>
        </div>
      </div>
    );
  }
);

export const TreeView = () => {
  const { loaded, selectedNode, treeRef } = useTree();
  const { settings, updateSetting } = useSettings();
  const [ref, setRef] = useState<Ref<SVGElement> | undefined>();
  useEffect(() => {
    setRef(treeRef as Ref<SVGElement>);
  }, []);

  const elementContainer = useRef(null);
  useDraggable(elementContainer);

  const tabsData = [
    {
      label: "Tree",
      content: (
        <>
          {!loaded ? (
            <h1 className="loading">Loading..</h1>
          ) : (
            <div style={{ height: "87%" }}>
              <SelectedNodeInfo
                ref={elementContainer}
                selectedNode={selectedNode as TreeHierarchyNode}
              />
              <TreeComponent ref={ref} />
            </div>
          )}
        </>
      ),
    },
    {
      label: "Options",
      content: (
        <TreeSettings settings={settings} updateSetting={updateSetting} />
      ),
    },
  ];

  return (
    <section className="wrapper">
      <Tabs tabs={tabsData} />
    </section>
  );
};

export default TreeView;
