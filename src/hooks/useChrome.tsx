import { useEffect, useState } from "react";

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
      if (tab?.id) {
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
      if (activeInfo.tabId !== tabId) {
        fetchTabIdAndUrl();
      }
    };

    chrome.tabs.onActivated.addListener(onTabChange);
    return () => chrome.tabs.onActivated.removeListener(onTabChange);
  }, [tabId]);

  const messageToSend = async (message, tabid?: number) => {
    try {
      const targetTabId = tabid || tabId;
      if (!targetTabId) throw new Error("Tab ID is undefined");

      const defaultMessage = { target: "sidepanel" };
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
      if (message.target === "runtime") {
        if (message.action === "onload-script-inspector-status") {
          const { active } = message.data;
          setIsInspectorActive(active);
        }
        if (message.action === "script-inspector-status") {
          const { active } = message.data;
          setIsInspectorActive(active);
        }
        // Additional message handling logic can be added here
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
    openedBy,
  };
};

export default useChrome;
