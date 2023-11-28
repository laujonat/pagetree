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
    // List of container tags
    const containerTags = [
      "DIV",
      "SECTION",
      "ARTICLE",
      "NAV",
      "ASIDE",
      "UL",
      "OL",
      "HEADER",
      "FOOTER",
      "MAIN",
    ];

    // Get the target element
    const targetElement = event.target;

    if (targetElement instanceof Element) {
      // Check if the target element is a container
      if (containerTags.includes(targetElement.tagName)) {
        // If it's a container, use it
        lastRightClickedElement = targetElement;
      } else if (targetElement.parentElement) {
        // If not, use its parent
        lastRightClickedElement = targetElement.parentElement;
      }
    }
  },
  true
);

// const serializer = new XMLSerializer();
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
      relayMessageToExtension(
        "open_side_panel",
        document.documentElement.outerHTML
      );
      break;
    case "toggle-dark-mode":
      chrome.storage.sync.set({ darkMode: "enabled" }).then(() => {
        document.body.classList.add("dark-mode");
      });
      break;
    case "extension-scan-page":
      sendResponse({ data: scanPage(document.documentElement) });
      break;
    case "process-selected-element-context":
      relayMessageToExtension(
        "process-context-menu-selection",
        scanPage(lastRightClickedElement)
      );
      break;
    case "process-selected-page-context":
      relayMessageToExtension(
        "process-context-menu-selection",
        scanPage(document.documentElement)
      );
      break;
    default:
      console.warn(`Unexpected message type received: '${message.action}'.`);
      return false;
  }
}

function relayMessageToExtension(type, data) {
  chrome.runtime.sendMessage({
    action: type,
    target: "runtime",
    data,
  });
}
