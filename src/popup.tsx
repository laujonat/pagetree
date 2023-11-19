import React, { useState } from "react";
import { Orientation } from "react-d3-tree";
import { createRoot } from "react-dom/client";

import PopupProvider from "./components/context/popup_provider";
import { TreeProvider } from "./components/context/tree_provider";
import DetailsPanel from "./components/popup/details_panel";
import PopupFooter from "./components/popup/footer";
import Header from "./components/popup/header";
import TreeView from "./components/tree/tree_view";
import { useCenteredTree } from "./hooks/useCenteredTree";

const Popup = () => {
  const [tabId, setTabId] = useState<number>();
  const [orientation, setOrientation] = useState<Orientation>("horizontal");
  const [translate, containerRef] = useCenteredTree(orientation);

  const setTreeOrientation = () => {};

  const handleSidePanelClick = async (event) => {
    console.log(event);
    if (tabId) {
      // @ts-ignore
      await chrome.sidePanel.open({ tabId });
      // @ts-ignore
      await chrome.sidePanel.setOptions({
        tabId,
        path: "sidepanel-tab.html",
        enabled: true,
      });
    }
  };
  const updateOrientation = (newOrientation) => setOrientation(newOrientation);

  return (
    <TreeProvider
      width={translate.x}
      height={translate.y}
      orientation={orientation}
    >
      <Header />
      <section className="inspector__container">
        <div className="inspector">
          <DetailsPanel />
          <div
            style={{ width: "100%", height: "80vh" }}
            id="treeWrapper"
            className="tree-container"
            ref={containerRef}
          >
            <TreeView
              orientation={orientation}
              updateOrientation={updateOrientation}
              // nodes={message}
              // w={translate.x || 0}
              // h={translate.y || 0}
            />
          </div>
        </div>
      </section>
      <PopupFooter onToggleOrientation={setTreeOrientation} />
      {/* <HelpDialog /> */}
    </TreeProvider>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <PopupProvider>
      <Popup />
    </PopupProvider>
  </React.StrictMode>
);
