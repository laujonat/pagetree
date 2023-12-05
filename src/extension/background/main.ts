import { ContextMenuId, MessageContent, MessageTarget } from "../../constants";
import { ContextType } from "../../types";

/* eslint-disable @typescript-eslint/ban-ts-comment */
let activeTab;
let connectedTab;

chrome.runtime.onConnect.addListener(function (port) {
  if (port && port.name === "pagetree-panel-extension") {
    connectedTab = port.sender?.tab?.id as number;
    if (connectedTab === undefined) {
      console.warn("Invalid tab ID");
    }
    port.onDisconnect.addListener(() => {
      if (!connectedTab) return;
      console.log("background port disconnecting", port.name);
      try {
        chrome.tabs.sendMessage(connectedTab, {
          action: MessageContent.inspectorStatus,
          target: MessageTarget.Sidepanel,
        });
      } catch (e) {
        console.error(e);
        if (connectedTab) {
          chrome.tabs.reload(connectedTab).then((result) => {
            console.error(
              "background task -> reload-active-tab on error",
              result
            );
          });
        }
      }
      console.log("Sidepanel closed.");
      connectedTab = undefined; // Reset the connected tab ID
    });
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.runtime.setUninstallURL("https://example.com/extension-survey");
  }
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

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.tabs.onActivated.addListener((activeInfo) => {
  activeTab = activeInfo.tabId;
  handleOnTabUpdate(activeTab);
});

// chrome.tabs.onUpdated.addListener((tabId, tabInfo) => {
//   if (tabId !== activeTab) {
//     console.info(tabId, tabInfo);
//     handleOnTabUpdate(tabId);
//   }
// });

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

chrome.action.onClicked.addListener(function (tab) {
  console.log("chrome action clicked", tab);
  chrome.tabs.sendMessage(tab?.id as number, {
    action: MessageContent.inspectorToggle,
    target: MessageTarget.Sidepanel,
    source: "buttonClick",
  });
});
chrome.contextMenus.onClicked.addListener(handleContextMenuClick);

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function shouldEnableSidePanelForURL(url) {
  return true; // Currently, it's enabled for all URLs
}

function handleInspectorClick(info) {
  let selector = info.tagName.toLowerCase();
  if (info.id) {
    selector += `#${info.id}`;
  }
  if (info.classes) {
    selector += `.${info.classes.split(" ").join(".")}`;
  }
  return selector;
}

function handleContextMenuClick(info, tab) {
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

async function handleBackgroundMessages(message, sender) {
  const { tab } = sender;
  // Return early if this message isn't meant for the background script
  if (message.target !== MessageTarget.Background) {
    return;
  }
  if (!tab.id || !tab.url) {
    return;
  }
  // Dispatch the message to an appropriate handler.
  switch (message.action) {
    case MessageContent.bgFetchActiveTabUrl:
      console.warn("background", tab?.url, MessageContent.bgFetchActiveTabUrl);
      chrome.tabs.sendMessage(tab.id, {
        action: MessageContent.activeTabUrl,
        target: MessageTarget.Sidepanel,
        data: { url: tab?.url },
      });
      break;
    case MessageContent.bgDocStatus:
      if (message.data.isDocumentAvailable) {
        chrome.tabs.sendMessage(tab.id, {
          action: MessageContent.scanPage,
          target: MessageTarget.Sidepanel,
        });
      }
      break;
    case MessageContent.openSidePanel:
      // @ts-ignore
      chrome.sidePanel.open({ tabId: tab.id });
      break;
    case MessageContent.inspectorSelect:
      chrome.tabs.sendMessage(tab.id, {
        action: MessageContent.inspectorSelect,
        target: MessageTarget.Sidepanel,
        data: handleInspectorClick(message.data),
      });
      break;
    case MessageContent.inspectorStatus:
      chrome.tabs.sendMessage(tab.id, {
        action: MessageContent.inspectorStatus,
        target: MessageTarget.Sidepanel,
      });
      break;
    case MessageContent.reloadExtension:
      chrome.tabs.reload(tab?.id as number).then((result) => {
        console.log("background task -> reload-active-tab", result);
      });
      break;
    default:
      console.warn(`Unexpected message type received: '${message.action}'.`);
  }
}

async function handleOnTabUpdate(tabId) {
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
