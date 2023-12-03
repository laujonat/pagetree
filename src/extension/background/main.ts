import { ContextType } from "../../types";

/* eslint-disable @typescript-eslint/ban-ts-comment */
let activeTabId;

async function getTabId() {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab.id;
}

async function getTabBadge(tabId) {
  try {
    console.log(
      "🚀 -----------------------------------------------------------🚀"
    );
    console.log("🚀 ⚛︎ file: background.ts:15 ⚛︎ getTabBadge ⚛︎ tabId:", tabId);
    console.log(
      "🚀 -----------------------------------------------------------🚀"
    );

    const iconFile = `../../assets/icon-active.png`;
    fetch(chrome.runtime.getURL(iconFile))
      .then((response) => response.blob())
      .then((blob) => createImageBitmap(blob))
      .then((imageBitmap) => {
        const osc = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
        const ctx = osc.getContext("2d");
        ctx?.drawImage(imageBitmap, 0, 0);
        const imageData = ctx?.getImageData(0, 0, osc.width, osc.height);
        chrome.action.setIcon({ tabId: tabId, imageData });
        chrome.action.setBadgeText({ tabId: tabId, text: "ok" });
      })
      .catch((error) => console.error("Error setting icon:", error));
  } catch (error) {
    console.error(error);
  }
}

// function trackOpenFromSource() {}

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

function createSelectorFromElementInfo(info) {
  let selector = info.tagName.toLowerCase();
  if (info.id) {
    selector += `#${info.id}`;
  }
  if (info.classes) {
    selector += `.${info.classes.split(" ").join(".")}`;
  }
  return selector;
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  activeTabId = activeInfo.tabId;
  updateSidePanelForTab(activeTabId);
});

chrome.tabs.onUpdated.addListener((tabId, tabInfo) => {
  if (tabId !== activeTabId) {
    console.info(tabId, tabInfo);
    updateSidePanelForTab(tabId);
  }
});

async function updateSidePanelForTab(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url) return;

    const url = new URL(tab.url);
    const isEnabled = shouldEnableSidePanelForURL(url);

    await chrome.sidePanel.setOptions({
      tabId,
      path: "sidepanel.html",
      enabled: isEnabled,
    });
  } catch (error) {
    console.error("Error updating side panel for tab:", error);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function shouldEnableSidePanelForURL(url) {
  // Define your logic to enable/disable the side panel based on the URL
  // For example, return true for specific sites or conditions
  return true; // Currently, it's enabled for all URLs
}
/* Persistent storage data setup  */
chrome.storage.onChanged.addListener((changes, namespace) => {
  for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${JSON.stringify(
        oldValue
      )}", new value is "${JSON.stringify(newValue)}".`
    );
  }
});

chrome.action.onClicked.addListener(async function (tab) {
  console.log("chrome action clicked", tab);
  chrome.tabs.sendMessage(tab?.id as number, {
    action: "script-toggle-inspector",
    target: "sidepanel",
    source: "buttonClick",
  });
  //   chrome.sidePanel.open({ tabId: tab.id });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  console.log("Tab ID:", tabId, "Change Info:", changeInfo);
  // Check if the tab update is complete
  if (changeInfo.status === "complete") {
    // Set icon and badge text once the tab is completely loaded
    getTabBadge(tabId);
    chrome.tabs.sendMessage(tabId, {
      action: "check-document-status",
      target: "sidepanel",
    });
  }
});

chrome.runtime.onMessage.addListener(handleBackgroundMessages);

async function handleBackgroundMessages(message, sender) {
  const { tab } = sender;
  console.log(message.action, tab.id);
  // Return early if this message isn't meant for the background script
  if (message.target !== "background") {
    return;
  }
  // Dispatch the message to an appropriate handler.
  switch (message.action) {
    case "fetch-current-tab-url":
      console.warn("URL", tab?.url);
      if (tab?.url) {
        chrome.tabs.sendMessage(tab.id, {
          action: "current-tab-url-response",
          target: "sidepanel",
          data: { url: tab?.url },
        });
      }
      break;
    case "document-status-response":
      if (message.data.isDocumentAvailable) {
        chrome.tabs.sendMessage(tab.id, {
          action: "extension-scan-page",
          target: "sidepanel",
        });
      }
      break;
    case "update-gentree-state":
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: "check-document-status",
          target: "sidepanel",
        });
      }
      break;
    case "process-inspector-selected-element":
      if (tab.id) {
        const elementSelector = createSelectorFromElementInfo(message.data);
        chrome.tabs.sendMessage(tab.id, {
          action: "process-inspector-selected-element",
          target: "sidepanel",
          data: elementSelector,
        });
      }
      break;
    case "reload-active-tab":
      if (tab.id) {
        chrome.tabs.reload(tab?.id as number).then((result) => {
          console.log("background task -> reload-active-tab", result);
        });
      }
      break;
    default:
      console.warn(`Unexpected message type received: '${message.action}'.`);
  }
}

chrome.contextMenus.onClicked.addListener(genericOnClick);

function genericOnClick(info, tab) {
  console.log("Tab ID:", tab.id, "clickinfo:", info);
  switch (info.menuItemId) {
    case "context-selector":
      chrome.tabs.sendMessage(tab.id, {
        action: "script-toggle-inspector",
        target: "sidepanel",
      });
      break;
    case "context-page":
      chrome.tabs.sendMessage(tab.id, {
        action: "process-selected-page-context",
        target: "sidepanel",
      });
      break;
    case "context-element":
      chrome.tabs.sendMessage(tab.id, {
        action: "process-selected-element-context",
        target: "sidepanel",
      });
      break;
    default:
      console.error("option unavailable");
  }
}

chrome.runtime.onInstalled.addListener(async function () {
  //   chrome.action.setBadgeText({ text: "0" });
  const contexts: ContextType[] = [
    "selection",
    "link",
    "editable",
    "image",
    "video",
    "audio",
  ];

  chrome.contextMenus.create({
    title: "Element Selector",
    contexts: ["all"],
    id: "context-selector",
  });

  chrome.contextMenus.create({
    title: "Visualize '%s' Element Tree",
    contexts: contexts,
    id: "context-element",
  });

  chrome.contextMenus.create({
    title: "Visualize Page Document Tree",
    contexts: ["all"],
    id: "context-page",
  });
});
let connectedTabId;

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === "pagetree-panel-extension") {
    console.group("background onConnect");
    console.log("port open on pagetree-panel-extension", port);
    if (port) {
      connectedTabId = port.sender?.tab?.id as number; // Store the connected tab ID
      if (connectedTabId !== undefined) {
        chrome.tabs.sendMessage(connectedTabId, {
          action: "check-document-status",
          target: "sidepanel",
        });
      } else {
        console.error("Invalid tab ID");
      }
    }

    port.onDisconnect.addListener(async () => {
      if (!connectedTabId) return false;
      console.log("background port disconnecting", port.name);
      try {
        chrome.tabs.sendMessage(connectedTabId, {
          action: "definite-stop-inspector",
          target: "sidepanel",
        });
      } catch (e) {
        console.error(e);
        if (connectedTabId) {
          chrome.tabs.reload(connectedTabId).then((result) => {
            console.error(
              "background task -> reload-active-tab on error",
              result
            );
          });
        }
      }
      console.log("Sidepanel closed.");
      connectedTabId = undefined; // Reset the connected tab ID
    });
  }
  console.groupEnd();
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.runtime.setUninstallURL("https://example.com/extension-survey");
  }
});
