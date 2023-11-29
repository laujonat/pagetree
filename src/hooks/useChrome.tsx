import { useEffect, useState } from "react";

const useChrome = () => {
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

  return { tabId };
};

export default useChrome;
