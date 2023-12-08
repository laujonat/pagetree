import { useEffect, useState } from "react";

import { MessageContent, MessageTarget } from "../constants";

export const useChrome = () => {
  const [tabId, setTabId] = useState<number | null>(null);
  const [tabUrl, setTabUrl] = useState<string>("");
  const [isInspectorActive, setIsInspectorActive] = useState<boolean>(false);
  const [openedBy, setOpenedBy] = useState<
    "contextMenu" | "buttonClick" | null
  >(null);

  const setSidePanelSource = (source: "contextMenu" | "buttonClick") => {
    setOpenedBy(source);
  };

  const fetchTabIdAndUrl = async () => {
    try {
      const queryOptions: chrome.tabs.QueryInfo = {
        active: true,
        lastFocusedWindow: true,
        status: "complete",
      };
      const [tab] = await chrome.tabs.query(queryOptions);
      if (tab?.id && tab?.url) {
        setTabId(tab.id);
        setTabUrl(tab.url || "");
      }
    } catch (error) {
      console.error("Error fetching tab ID and URL:", error);
    }
  };

  useEffect(() => {
    fetchTabIdAndUrl();

    const onTabChange = async (activeInfo) => {
      console.log("activeInfo tab", activeInfo);
      if (activeInfo.tabId !== tabId) {
        fetchTabIdAndUrl();
      }
    };

    chrome.tabs.onActivated.addListener(onTabChange);
    return () => chrome.tabs.onActivated.removeListener(onTabChange);
  }, []);

  const messageToSend = async (message, tabid?: number) => {
    console.log(tabId, tabid, JSON.stringify(message));
    try {
      const targetTabId = tabid || tabId;
      if (!targetTabId) throw new Error("Tab ID is undefined");

      const defaultMessage = { target: MessageTarget.Sidepanel };
      const finalMessage = { ...defaultMessage, ...message };
      const response = await chrome.tabs.sendMessage(targetTabId, finalMessage);
      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleMessage = (message, sender, sendResponse) => {
      if (message.target === MessageTarget.Runtime) {
        switch (message.action) {
          case MessageContent.inspectorStatus:
            setIsInspectorActive(message.data.active);
            break;
          default:
            break;
        }
      }
    };
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  return {
    tabId,
    tabUrl,
    isInspectorActive,
    messageToSend,
    setSidePanelSource,
    setTabId,
    openedBy,
  };
};

export default useChrome;
