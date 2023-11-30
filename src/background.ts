/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck types unavailable?

/* Persistent storage data setup  */
chrome.storage.onChanged.addListener((changes, namespace) => {
  for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${oldValue}", new value is "${newValue}".`
    );
  }
});

chrome.action.onClicked.addListener(async function (tab) {
  await chrome.sidePanel.open({ tabId: tab.id });

  await chrome.sidePanel.setOptions({
    tabId: tab.id,
    path: "sidepanel.html",
    enabled: true,
  });
});

chrome.tabs.onUpdated.addListener(async function (tabid, changeinfo, tab) {
  await new Promise<void>((resolve) => {
    chrome.tabs.onUpdated.addListener(async function listener(tabId, info) {
      if (changeinfo.status === "complete") {
        const iconFile = `icons/icon-active.png`;
        // There are easier ways for a page to extract an image's imageData, but the approach used here
        // works in both extension pages and service workers.
        const response = await fetch(chrome.runtime.getURL(iconFile));
        const blob = await response.blob();
        const imageBitmap = await createImageBitmap(blob);
        const osc = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
        const ctx = osc.getContext("2d");
        ctx?.drawImage(imageBitmap, 0, 0);
        const imageData = ctx?.getImageData(0, 0, osc.width, osc.height);

        chrome.action.setIcon({ tabId: tabId, imageData });
        chrome.action.setBadgeText({ text: "ok" });
        resolve();
      }
    });
  });
  //   console.info("chrome.tabs.onUpdated.addListenerid", tabid);
  //   handleBackgroundReady(tabid);
});

chrome.runtime.onMessage.addListener(handleBackgroundMessages);
async function handleBackgroundMessages(message, { tab }) {
  // Return early if this message isn't meant for the background script
  if (message.target !== "background") {
    return;
  }
  // Dispatch the message to an appropriate handler.
  switch (message.action) {
    case "process-context-menu-selection":
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, message);
      }
      break;
    case "reload-active-tab":
      console.log("background reload");
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

chrome.scripting
  .getRegisteredContentScripts()
  .then((scripts) => console.log("registered content scripts", scripts));

chrome.contextMenus.onClicked.addListener(genericOnClick);

function genericOnClick(info, tab) {
  chrome.sidePanel.open({ windowId: tab.windowId });
  switch (info.menuItemId) {
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

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(async function (tab) {
  chrome.action.setBadgeText({ text: "0" });
  const contexts = ["selection", "link", "editable", "image", "video", "audio"];

  chrome.contextMenus.create({
    title: "Visualize '%s' Element Tree",
    contexts: [...contexts],
    id: "context-element",
  });

  // Create a parent item and two children.
  chrome.contextMenus.create({
    title: "Visualize Page Document Tree",
    contexts: ["all"],
    id: "context-page",
  });
});

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === "pagetree-panel-extension") {
    port.onDisconnect.addListener(async () => {
      console.log("Sidepanel closed.");
    });
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.runtime.setUninstallURL("https://example.com/extension-survey");
  }
});
