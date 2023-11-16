import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import DetailsPanel from "./components/details_panel";
import Header from "./components/header";
import HelpDialog from "./components/help_dialog";
import PopupProvider from "./components/popup_context";
import TreeView from "./components/tree_view";

const Popup = () => {
  const [count, setCount] = useState(0);
  const [tabid, settabid] = useState<number>();
  const [message, setMessage] = useState<TreeNode>();

  useEffect(() => {
    async function tabQuery() {
      // @ts-ignore
      await chrome.tabs.query(
        {
          active: true,
          lastFocusedWindow: true,
        },
        function (tab) {
          console.log("tab", tab);
          settabid(tab[0].id);
        }
      );
    }
    tabQuery();
  }, []);

  useEffect(() => {
    console.log("popuptabid", tabid);
    async function scanActiveTabHTML(text) {
      const response = await chrome.tabs.sendMessage(tabid as number, text);
      console.log("sendmessagetoactivei", response);
      // @ts-ignore
      if (response.data) {
        // @ts-ignore
        setMessage(response.data);
      }
      // @ts-ignore
      //   setMessage(response.data as TreeNode);
    }
    if (!isNaN(tabid as number)) scanActiveTabHTML("hello?");
  }, [tabid]);

  return (
    <>
      <Header />
      <DetailsPanel />
      {message && <TreeView nodes={message} />}
      <HelpDialog />
    </>
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
