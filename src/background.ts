chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: "0" });
});
chrome.runtime.onStartup.addListener(() => {
  console.log("startup!");
  chrome.action.setBadgeText({ text: "!" });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${oldValue}", new value is "${newValue}".`
    );
  }
});

chrome.tabs.onUpdated.addListener(async function (tabid, changeinfo, tab) {
  console.log("background task");
  console.warn(arguments);
  await new Promise<void>((resolve) => {
    handleBackgroundReady(tabid);
    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
      if (changeinfo.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    });
  });
  //   console.info("chrome.tabs.onUpdated.addListenerid", tabid);
  //   handleBackgroundReady(tabid);
});

chrome.action.onClicked.addListener(async (tab) => {
  console.warn("action onclicked background");
  //   const tabs = await chrome.tabs.query({
  //     url: chrome.runtime.getURL("popup.html"),
  //   });
  // Wait for the receiver tab to load
  //   await new Promise<void>((resolve) => {
  //     chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
  //       if (info.status === "complete") {
  //         chrome.tabs.onUpdated.removeListener(listener);
  //         resolve();
  //       }
  //     });
  //   });
  //   const receiverTabId = tabs[0].id;
  //   console.info("chrome.action.onClickedd", receiverTabId);
  //   handleBackgroundReady(receiverTabId);
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
async function handleBackgroundReady(receiverTabId) {
  // Send a message to the receiver tab
  chrome.tabs.sendMessage(receiverTabId, {
    target: "popup",
    action: "notify-client-ready",
    data: {
      ready: true,
    },
  });
}
