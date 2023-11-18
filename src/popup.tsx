import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import DetailsPanel from "./components/details_panel";
import Header from "./components/header";
import HelpDialog from "./components/help_dialog";
import PopupProvider from "./components/popup_context";
import TreeView from "./components/tree/tree_view";
import { useCenteredTree } from "./hooks/tree";
import { TreeNode } from "./types";

const Popup = () => {
  const [tabId, setTabId] = useState<number>();
  const [message, setMessage] = useState<TreeNode>();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [translate, containerRef] = useCenteredTree();
  const [dimension, setDimension] = useState<{
    width: number;
    height: number;
  }>();

  useEffect(() => {
    console.log("TRANSLATE", translate);
  }, [translate]);

  useEffect(() => {
    async function scanActiveTabHTML(message) {
      chrome.tabs.query(
        {
          active: true,
          lastFocusedWindow: true,
        },
        async function (tab) {
          console.log("tab", tab);
          setTabId(tab[0].id);
          if (tab[0].id as number) {
            const response = await chrome.tabs.sendMessage(
              tab[0].id as number,
              message
            );
            console.log("sendmessagetoactivei", response);
            // @ts-ignore
            if (response.data) {
              // @ts-ignore
              setMessage(response.data);
              setLoaded(true);
            }
          }
        }
      );
    }
    scanActiveTabHTML({ target: "popup", action: "extension-scan-element" });
    console.log("popuptabid", tabId);
  }, []);

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

  return (
    <PopupProvider>
      <Header />
      <DetailsPanel />
      {/* <button onClick={handleSidePanelClick} style={{ marginRight: "5px" }}>
        Side Panel
    </button> */}
      <div
        style={{ width: "100%", height: "80vh" }}
        id="treeWrapper"
        className="tree-container"
        ref={containerRef}
      >
        {loaded && (
          <TreeView nodes={message} w={translate.x || 0} h={translate.y || 0} />
        )}
      </div>
      <HelpDialog />
    </PopupProvider>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
