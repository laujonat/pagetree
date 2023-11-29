import { Ref, useEffect, useRef, useState } from "react";

import { useDraggable } from "../../hooks/useDraggable";
import { useSettings } from "../../hooks/useSettings";
import { useTree } from "../../hooks/useTree";
import { TreeHierarchyNode } from "../../types";
import { Tabs } from "../common/tabs";
import { TreeActionsToolbar } from "./TreeActionsToolbar";
import { TreeComponent } from "./TreeComponent";
import { TreeSettings } from "./TreeSettings";

export const TreeLayout = () => {
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
              <TreeActionsToolbar
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

export default TreeLayout;
