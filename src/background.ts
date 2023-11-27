// @ts-nocheck

chrome.runtime.onConnect.addListener(() => {
  console.log("Onconnect");
});

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
async function handleBackgroundMessages(message) {
  // Return early if this message isn't meant for the background script
  if (message.target !== "background") {
    return;
  }
  // Dispatch the message to an appropriate handler.
  switch (message.type) {
    case "add-exclamationmarks-result":
      handleBackgroundResultTest(message.data);
      break;
    default:
      console.warn(`Unexpected message type received: '${message.type}'.`);
  }
}

async function handleBackgroundResultTest(dom) {
  console.log("Received dom in background", dom);
}

async function handleSelection() {
  chrome.tabs.query(
    { active: true, lastFocusedWindow: true },
    async (tabs, ...others) => {
      console.log("others", others);
      if (tabs[0]?.id) {
        //   const response = await chrome.tabs.sendMessage(tabs[0].id, message);
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "process-selected-element",
          target: "popup",
        });
      }
    }
  );
}

chrome.contextMenus.onClicked.addListener(genericOnClick);
function genericOnClick(info, tab) {
  console.log("info", info);
  switch (info.menuItemId) {
    case "selection":
      handleSelection();
      break;
    case "checkbox":
      // Checkbox item function
      console.log("Checkbox item clicked. Status:", info.checked);
      break;
    default:
      // Standard context menu item function
      chrome.sidePanel.open({ windowId: tab.windowId });
  }
}

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(async function () {
  chrome.action.setBadgeText({ text: "0" });
  // Create one test item for each context type.
  const contexts = [
    "page",
    "selection",
    "link",
    "editable",
    "image",
    "video",
    "audio",
  ];

  chrome.contextMenus.create({
    title: "Generate Tree for '%s' Element",
    contexts: [...contexts],
    id: "context-element",
  });

  // Create a parent item and two children.
  chrome.contextMenus.create({
    title: "Generate Tree for this Page",
    id: "context-page",
  });
});
