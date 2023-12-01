/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck types unavailable?
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
  console.warn("chrome action clicked", tab);
  await chrome.sidePanel.open({ tabId: tab.id });
  await chrome.sidePanel.setOptions({
    tabId: tab.id,
    path: "sidepanel.html",
    enabled: true,
  });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  // Log the change info for debugging
  console.log("Tab ID:", tabId, "Change Info:", changeInfo);
  // Check if the tab update is complete
  if (changeInfo.status === "complete") {
    // Set icon and badge text once the tab is completely loaded
    const iconFile = `icons/icon-active.png`;
    fetch(chrome.runtime.getURL(iconFile))
      .then((response) => response.blob())
      .then((blob) => createImageBitmap(blob))
      .then((imageBitmap) => {
        const osc = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
        const ctx = osc.getContext("2d");
        ctx.drawImage(imageBitmap, 0, 0);
        const imageData = ctx.getImageData(0, 0, osc.width, osc.height);

        chrome.action.setIcon({ tabId: tabId, imageData });
        chrome.action.setBadgeText({ tabId: tabId, text: "ok" });

        // Send a message to check document status
        chrome.tabs.sendMessage(tabId, {
          action: "check-document-status",
          target: "sidepanel",
        });
      })
      .catch((error) => console.error("Error setting icon:", error));
  }
});

chrome.runtime.onMessage.addListener(handleBackgroundMessages);
async function handleBackgroundMessages(message, { tab }) {
  // Return early if this message isn't meant for the background script
  if (message.target !== "background") {
    return;
  }
  // Dispatch the message to an appropriate handler.
  switch (message.action) {
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
        chrome.tabs.sendMessage(tab.id, message);
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
  chrome.sidePanel.open({ tabId: tab.id });
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

chrome.runtime.onInstalled.addListener(async function () {
  //   chrome.action.setBadgeText({ text: "0" });
  const contexts = ["selection", "link", "editable", "image", "video", "audio"];
  chrome.contextMenus.create({
    title: "Visualize '%s' Element Tree",
    contexts: [...contexts],
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
            console.log(
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
