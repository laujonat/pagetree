import { scanPage } from "./parser";

interface IMessage {
  target: "sidepanel" | "popup";
  action: string;
}

chrome.runtime.onMessage.addListener(handleMessages);

async function handleMessages(
  message: IMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse
) {
  console.log("messag", message, sender);
  // Return early if this message isn't meant for the offscreen document.
  if (message.target !== "popup") {
    return false;
  }

  // Dispatch the message to an appropriate handler.
  console.log("message.action", message.action);
  switch (message.action) {
    case "test-action":
      sendToBackground(
        "add-exclamationmarks-result",
        document.documentElement.outerHTML
      );
      break;
    case "toggle-dark-mode":
      chrome.storage.sync.set({ darkMode: "enabled" }).then(() => {
        document.body.classList.add("dark-mode");
      });
      break;
    case "extension-scan-element":
      sendResponse({ data: scanPage(document.documentElement) });
      break;
    default:
      console.warn(`Unexpected message type received: '${message.action}'.`);
      return false;
  }
}

function sendToBackground(type, data) {
  chrome.runtime.sendMessage({
    type,
    target: "background",
    data,
  });
}
