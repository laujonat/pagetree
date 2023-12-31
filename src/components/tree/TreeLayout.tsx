import { Ref, useEffect, useState } from "react";
import { Tree } from "react-d3-tree";
import Text from "react-svg-text";

import { useChrome } from "@/hooks/useChrome";
import { useSettings } from "@/hooks/useSettings";
import { useTree } from "@/hooks/useTree";
import { IconLoading } from "@/icons";

import { DevToolsElement } from "../features/Element";
import { Tabs } from "../features/PanelTabs";
import { TreeComponent } from "./TreeComponent";
import { TreeSettings } from "./TreeSettings";

const CountElement = ({ nodeCount }) => {
  return (
    <Text
      strokeWidth={0}
      fontFamily="monospace"
      fill="var(--icon-fill)"
      fontWeight={500}
      fontSize="0.825rem"
      textRendering="optimizeLegibility"
      textAnchor="middle" // Center the text horizontally
      alignmentBaseline="middle" // Center the text vertically
      style={{ marginLeft: "1em" }}
      x={25}
      y={-20}
    >
      {`Total Element Node in Tree: ${nodeCount}`}
    </Text>
  );
};

export const TreeLayout = () => {
  const { loaded, treeRef, selectedNode, nodeCount } = useTree();
  const { settings, updateSetting } = useSettings();
  const { openedBy } = useChrome();
  const [ref, setRef] = useState<Ref<SVGElement> | undefined>();

  useEffect(() => {
    setRef(treeRef as Ref<SVGElement>);
  }, []);

  const renderContentBasedOnSource = () => {
    if (!loaded) {
      return <IconLoading />;
    } else if (openedBy === "contextMenu") {
      return <div>Select an element to visualize the tree.</div>;
    } else {
      return (
        <div className="tree__layout">
          <div className="tree__layout_element">
            <div className="webkit-element__scrollable">
              {selectedNode?.data && <DevToolsElement {...selectedNode.data} />}
            </div>
          </div>
          <TreeComponent ref={ref as Ref<Tree>} />
          {nodeCount && <CountElement nodeCount={nodeCount} />}
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
