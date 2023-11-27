import { scanPage } from "./utils/parser";

interface IMessage {
  target: "sidepanel" | "popup";
  action: string;
  data: object;
}

chrome.runtime.onMessage.addListener(handleMessages);
let lastRightClickedElement;

document.addEventListener(
  "contextmenu",
  function (event) {
    lastRightClickedElement = event.target;
  },
  true
);

async function handleMessages(
  message: IMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse
) {
  // Return early if this message isn't meant for the offscreen document.
  if (message.target !== "popup" && message.target !== "sidepanel") {
    return false;
  }

  // Dispatch the message to an appropriate handler.
  switch (message.action) {
    case "test-action":
      sendToBackground("open_side_panel", document.documentElement.outerHTML);
      break;
    case "toggle-dark-mode":
      chrome.storage.sync.set({ darkMode: "enabled" }).then(() => {
        document.body.classList.add("dark-mode");
      });
      break;
    case "extension-scan-element":
      sendResponse({ data: scanPage(document.documentElement) });
      break;
    case "process-selected-element":
      sendResponse({
        action: "process-selected-element",
        data: scanPage(lastRightClickedElement),
      });
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
