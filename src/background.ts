chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: "0" });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${oldValue}", new value is "${newValue}".`
    );
  }
});

chrome.action.onClicked.addListener(async () => {
  handleBackgroundResultTest("add-exclamationmarks-to-headings");
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
