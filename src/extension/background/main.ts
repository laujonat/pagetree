import { ContextMenuId, MessageContent, MessageTarget } from "../../constants";
import { Badge as BadgeAction } from "./badge";
import { createSelector, getMenuOptions } from "./userfunctions";

/* eslint-disable @typescript-eslint/ban-ts-comment */
let activeTab;
let connectedTab;
let badge;
const activeTabs = new Set(); // Track tabs where the extension is active

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onConnect.addListener(function (port) {
  if (port && port.name === "pagetree-panel-extension") {
    connectedTab = port.sender?.tab?.id as number;

    const connectedTabUrl = port.sender?.tab?.url;

    if (connectedTabUrl) {
      const connectedTabOrigin = new URL(connectedTabUrl).origin;

      if (connectedTab === undefined || !connectedTabOrigin) {
        console.warn("Invalid tab ID or origin");
      }
    }
    port.onDisconnect.addListener(() => {
      if (!connectedTab) return;
      console.log("background port disconnecting", port.name);
      try {
        chrome.tabs.sendMessage(connectedTab, {
          action: MessageContent.inspectorStatus,
          target: MessageTarget.Sidepanel,
        });
        activeTabs.delete(connectedTab);
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

chrome.runtime.onInstalled.addListener(getMenuOptions);

/**
 * Fires when the active tab in a window changes.
 * Note that the tab's URL may not be set at the time this event fired, but you can listen to onUpdated events so as to be notified when a URL is set.
 */
chrome.tabs.onActivated.addListener((activeInfo) => {
  badge = new BadgeAction(activeTab);
  activeTab = activeInfo.tabId;
  if (!activeTabs.has(activeTab)) {
    chrome.sidePanel.setOptions({
      tabId: activeTab,
      enabled: false,
    });
  }
  badge.stop();
});

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

chrome.contextMenus.onClicked.addListener(handleContextMenuClick);

chrome.action.onClicked.addListener(function (tab) {
  if (tab.id) {
    activeTabs.add(tab.id);

    chrome.sidePanel.setOptions({
      tabId: tab.id,
      path: "sidepanel.html",
      enabled: true,
    });
    // @ts-ignore
    chrome.sidePanel.open({ tabId: tab.id });
  }
});
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  console.log("Tab ID:", tabId, "Change Info:", changeInfo);
  handleOnTabUpdate(tabId);
  if (activeTabs.has(tabId) && changeInfo.status === "complete") {
    chrome.tabs.sendMessage(tabId, {
      action: MessageContent.checkDocStatus,
      target: MessageTarget.Sidepanel,
    });
  }
});

chrome.runtime.onMessage.addListener(handleBackgroundMessages);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function shouldEnableSidePanelTab(tab) {
  return activeTabs.has(tab); // Currently, it's enabled for all URLs
}

function handleContextMenuClick(info, tab) {
  if (tab.id) {
    activeTabs.add(tab.id);

    // Open the side panel and send a message to the content script
    chrome.sidePanel.setOptions({
      tabId: tab.id,
      path: "sidepanel.html",
      enabled: true,
    });
  }

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
  // The callback for runtime.onMessage must return falsy if we're not sending a response
  (async () => {
    if (message.type === "open_side_panel") {
      // @ts-ignore
      await chrome.sidePanel.open({ tabId: sender.tab.id });
      await chrome.sidePanel.setOptions({
        tabId: sender.tab.id,
        path: "sidepanel.html",
        enabled: true,
      });
    }
  })();
  if (!connectedTab) return;
  const { tab } = sender;
  console.log("background action", message.action);

  // Return early if this message isn't meant for the background script
  if (message.target !== MessageTarget.Background) {
    return;
  }

  if (!tab.id || !tab.url) {
    return;
  }
  if (!badge) {
    badge = new BadgeAction(tab.id);
  }
  activeTab = tab.id;

  // Dispatch the message to an appropriate handler.
  switch (message.action) {
    case MessageContent.bgFetchActiveTabUrl:
      console.warn("background", tab?.url, MessageContent.bgFetchActiveTabUrl);
      chrome.tabs.sendMessage(tab.id, {
        action: MessageContent.activeTabUrl,
        target: MessageTarget.Sidepanel,
        data: { url: tab?.url },
      });
      badge.stop();
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
    case MessageContent.inspectorBadgeActivate:
      badge.start();
      badge.setText("ON");
      break;
    case MessageContent.inspectorBadgeDeactivate:
      console.log("deactivating inspctor badge");
      badge.stop();
      chrome.tabs.sendMessage(tab.id, {
        action: MessageContent.inspectorForceStop,
        target: MessageTarget.Sidepanel,
      });
      break;
    case MessageContent.inspectorSelect:
      console.log("inspectorselect backgorund", message.data);
      try {
        chrome.tabs.sendMessage(tab.id, {
          action: MessageContent.inspectorSelect,
          target: MessageTarget.Sidepanel,
          data: createSelector(message.data),
        });
      } catch (e) {
        console.error(e);
      }
      break;
    case MessageContent.colorScheme:
      chrome.tabs.sendMessage(tab.id, {
        action: MessageContent.colorScheme,
        target: MessageTarget.Sidepanel,
        data: message.data,
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
      if (badge) {
        badge.pause();
      }
      break;
    default:
      console.warn(`Unexpected message type received: '${message.action}'.`);
  }
}

async function handleOnTabUpdate(tabId) {
  console.log("handleOnTabUpdate", tabId);
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url) return;

    if (!activeTabs.has(activeTab)) {
      chrome.sidePanel.setOptions({
        tabId: activeTab,
        enabled: false,
      });
    }
  } catch (error) {
    console.error("Error updating side panel for tab:", error);
  }
}
// async function getCurrentTab() {
//   const queryOptions = { active: true, lastFocusedWindow: true };
//   // `tab` will either be a `tabs.Tab` instance or `undefined`.
//   const [tab] = await chrome.tabs.query(queryOptions);
//   return tab;
// }

chrome.tabs.onRemoved.addListener((tabId) => {
  activeTabs.delete(tabId);
  console.warn("onremoved result", activeTabs);
});
