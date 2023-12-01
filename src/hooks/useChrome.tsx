import { useEffect, useState } from "react";

export const useChrome = () => {
  const [tabId, setTabId] = useState<number>();

  useEffect(() => {
    // Fetch the current active tab ID
    const fetchTabId = async () => {
      try {
        const queryOptions = { active: true, currentWindow: true };
        const [tab] = await chrome.tabs.query(queryOptions);
        if (tab?.id) {
          setTabId(tab.id);
        }
      } catch (error) {
        console.error("Error fetching tab ID:", error);
      }
    };

    fetchTabId();

    // Listen for tab changes
    const onTabChange = (activeInfo) => {
      if (activeInfo.tabId !== tabId) {
        setTabId(activeInfo.tabId);
      }
    };

    chrome.tabs.onActivated.addListener(onTabChange);

    return () => {
      chrome.tabs.onActivated.removeListener(onTabChange);
    };
  }, [tabId]);

  // Function to send messages to the content script
  const messageToSend = async (message, tabid?: number) => {
    if (tabId !== undefined || tabid) {
      try {
        const defaultMessage = { target: "sidepanel" };
        const finalMessage = { ...defaultMessage, ...message };
        const response = await chrome.tabs.sendMessage(
          tabId || (tabid as number),
          finalMessage
        );

        return response;
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      console.error("Tab ID is undefined.");
    }
    return false;
  };

  return { tabId, messageToSend };
};

export default useChrome;
