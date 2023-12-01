import { Ref, useEffect, useRef, useState } from "react";

import { useDraggable } from "../../hooks/useDraggable";
import { useSettings } from "../../hooks/useSettings";
import { useTree } from "../../hooks/useTree";
import { DevToolsElement } from "../common/info";
import { Tabs } from "../common/tabs";
import { TreeComponent } from "./TreeComponent";
import { TreeSettings } from "./TreeSettings";

export const TreeLayout = () => {
  const { loaded, treeRef, selectedNode } = useTree();
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
            <div className="loader"></div>
          ) : (
            <div style={{ height: "87%" }}>
              <div className="tree__layout_element">
                <div
                  className="webkit-element__scrollable"
                  ref={elementContainer}
                >
                  {selectedNode?.data && (
                    <DevToolsElement {...selectedNode.data} />
                  )}
                </div>
              </div>
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
