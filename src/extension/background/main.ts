import { ContextMenuId, MessageContent, MessageTarget } from "../../constants";
import { ContextType } from "../../types";

/* eslint-disable @typescript-eslint/ban-ts-comment */
let activeTabId;

async function getTabBadge(tabId) {
  try {
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
    action: MessageContent.inspectorToggle,
    target: MessageTarget.Sidepanel,
    source: "buttonClick",
  });
  //   chrome.sidePanel.open({ tabId: tab.id });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  console.log("Tab ID:", tabId, "Change Info:", changeInfo);
  if (changeInfo.status === "complete") {
    getTabBadge(tabId);
    chrome.tabs.sendMessage(tabId, {
      action: MessageContent.checkDocStatus,
      target: MessageTarget.Sidepanel,
    });
  }
});

chrome.runtime.onMessage.addListener(handleBackgroundMessages);

async function handleBackgroundMessages(message, sender) {
  const { tab } = sender;
  console.log(message);
  //   console.log(message.action, tab.id);
  // Return early if this message isn't meant for the background script
  if (message.target !== MessageTarget.Background) {
    return;
  }
  // Dispatch the message to an appropriate handler.
  switch (message.action) {
    case MessageContent.bgFetchActiveTabUrl:
      console.warn("background", tab?.url, MessageContent.bgFetchActiveTabUrl);
      if (tab?.url) {
        chrome.tabs.sendMessage(tab.id, {
          action: MessageContent.activeTabUrl,
          target: MessageTarget.Sidepanel,
          data: { url: tab?.url },
        });
      }
      break;
    case MessageContent.bgDocStatus:
      if (message.data.isDocumentAvailable) {
        chrome.tabs.sendMessage(tab.id, {
          action: MessageContent.scanPage,
          target: MessageTarget.Sidepanel,
        });
      }
      break;
    // case MessageContent.updateGenTree:
    //   console.log("update gen tree from bg");
    //   if (tab.id) {
    //     chrome.tabs.sendMessage(tab.id, {
    //       action: MessageContent.checkDocStatus,
    //       target: MessageTarget.Sidepanel,
    //     });
    //   }
    //   break;
    case MessageContent.openSidePanel:
      if (tab.id) {
        // @ts-ignore
        chrome.sidePanel.open({ tabId: tab.id });
      }
      break;
    case MessageContent.inspectorSelect:
      if (tab.id) {
        const elementSelector = createSelectorFromElementInfo(message.data);
        chrome.tabs.sendMessage(tab.id, {
          action: MessageContent.inspectorSelect,
          target: MessageTarget.Sidepanel,
          data: elementSelector,
        });
      }
      break;
    case MessageContent.inspectorStatus:
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: MessageContent.inspectorStatus,
          target: MessageTarget.Sidepanel,
        });
      }
      break;
    case MessageContent.reloadExtension:
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
    case ContextMenuId.selector:
      chrome.tabs.sendMessage(tab.id, {
        action: MessageContent.inspectorToggle,
        target: MessageTarget.Sidepanel,
      });
      break;
    case ContextMenuId.page:
      // @ts-ignore method exists
      chrome.sidePanel.open({ tabId: tab.id });
      chrome.tabs.sendMessage(tab.id, {
        action: MessageContent.fullPageOption,
        target: MessageTarget.Sidepanel,
      });
      break;
    case ContextMenuId.element:
      // @ts-ignore method exists
      chrome.sidePanel.open({ tabId: tab.id });
      chrome.tabs.sendMessage(tab.id, {
        action: MessageContent.highlightTextOption,
        target: MessageTarget.Sidepanel,
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
    id: ContextMenuId.selector,
  });

  chrome.contextMenus.create({
    title: "Visualize '%s' Element Tree",
    contexts: contexts,
    id: ContextMenuId.element,
  });

  chrome.contextMenus.create({
    title: "Visualize Page Document Tree",
    contexts: ["all"],
    id: ContextMenuId.page,
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
        // chrome.tabs.sendMessage(connectedTabId, {
        //   action: MessageContent.checkDocStatus,
        //   target: MessageTarget.Sidepanel,
        // });
      } else {
        console.error("Invalid tab ID");
      }
    }

    port.onDisconnect.addListener(async () => {
      if (!connectedTabId) return false;
      console.log("background port disconnecting", port.name);
      try {
        chrome.tabs.sendMessage(connectedTabId, {
          action: MessageContent.inspectorStatus,
          target: MessageTarget.Sidepanel,
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
