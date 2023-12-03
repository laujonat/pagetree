import { Ref, useEffect, useState } from "react";

import useChrome from "../../hooks/useChrome";
import { useSettings } from "../../hooks/useSettings";
import { useTree } from "../../hooks/useTree";
import { DevToolsElement } from "../common/Header";
import { Tabs } from "../common/Tabs";
import { TreeComponent } from "./TreeComponent";
import { TreeSettings } from "./TreeSettings";

export const TreeLayout = () => {
  const { loaded, treeRef, selectedNode } = useTree();
  const { settings, updateSetting } = useSettings();
  const { openedBy } = useChrome();
  const [ref, setRef] = useState<Ref<SVGElement> | undefined>();
  useEffect(() => {
    setRef(treeRef as Ref<SVGElement>);
  }, []);

  const renderContentBasedOnSource = () => {
    console.log("LOADED->renderContentBasedOnSource", loaded);
    if (!loaded) {
      return <div className="loader"></div>;
    } else if (openedBy === "contextMenu") {
      return <div>Select an element to visualize the tree.</div>;
    } else {
      return (
        <div style={{ height: "87%", width: "100%" }}>
          <div className="tree__layout_element">
            <div className="webkit-element__scrollable">
              {selectedNode?.data && <DevToolsElement {...selectedNode.data} />}
            </div>
          </div>
          <TreeComponent ref={ref} />
        </div>
      );
    }
  };

  const tabsData = [
    {
      label: "Tree",
      content: renderContentBasedOnSource(),
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
