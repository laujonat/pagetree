import { IMessage, IRelayMessageOptions } from "../types";
import { createTreeNodes } from "../utils/d3node";
import Inspector from "./scripts/inspector";

let isInspectorActive = false;

const port = chrome.runtime.connect({ name: "pagetree-panel-extension" });
console.info("pagetree-connect", port);

chrome.runtime.onMessage.addListener(handleSidepanelMessages);

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
function waitForDOMReady(callback) {
  let timer;
  const observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      observer.disconnect();
      callback();
    }, 500); // Adjust the timeout to suit the page's load characteristics
  });
  observer.observe(document, {
    childList: true,
    subtree: true,
  });
}
async function handleSidepanelMessages(
  message: IMessage,
  sender: chrome.runtime.MessageSender,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  sendResponse: (response?: any) => void
) {
  console.log("content", message, sender);
  // Return early if this message isn't meant for the sidepanel document.
  if (message.target !== "sidepanel") {
    return false;
  }

  const { tab } = sender;
  // Dispatch the message to an appropriate handler.
  switch (message.action) {
    case "check-document-status":
      console.log("checking document status");
      waitForDOMReady(() => {
        relayMessageToExtension({
          type: "document-status-response",
          data: { isDocumentAvailable: true },
          target: "background",
        });
      });
      break;
    case "fetch-current-tab-url":
      relayMessageToExtension({
        type: "fetch-current-tab-url",
        target: "background",
      });
      break;
    case "current-tab-url-response":
      relayMessageToExtension({
        type: "current-tab-url-response",
        data: { url: message.data.url },
      });
      break;
    case "toggle-dark-mode":
      chrome.storage.sync.set({ darkMode: "enabled" }).then(() => {
        document.documentElement.setAttribute("data-theme", "dark");
      });
      break;
    case "extension-scan-page":
      sendTreeData();
      break;
    case "resend-tree-data": // New case to handle re-sending data
      sendTreeData();
      break;
    case "process-selected-element-context":
      relayMessageToExtension({
        type: "update-gentree-state",
        data: createTreeNodes(lastRightClickedElement),
      });
      break;
    case "process-selected-page-context":
      relayMessageToExtension({
        type: "update-gentree-state",
        data: createTreeNodes(document.documentElement),
      });
      break;
    case "process-inspector-selected-element":
      if (message.data) {
        const element = document.querySelector(message.data);
        relayMessageToExtension({
          type: "update-gentree-state",
          data: createTreeNodes(element),
        });
      } else {
        console.error("No selected element to process");
      }
      break;
    case "script-toggle-inspector":
      console.log("script toggle inspector");
      try {
        if (isInspectorActive) {
          forceInspectorStop();
        } else {
          Inspector.activate();
          isInspectorActive = true;
        }
        relayMessageToExtension({
          type: "script-inspector-status",
          data: {
            active: isInspectorActive,
          },
        });
      } catch (e) {
        forceInspectorStop();
        throw new Error("InspectorErr");
      }
      break;
    case "extension-inspector-status":
      console.log("checking inspector status");
      relayMessageToExtension({
        type: "onload-script-inspector-status",
        data: {
          active: isInspectorActive,
        },
      });
      break;
    case "definite-stop-inspector":
      console.log("Force deactivate inspector", sender);
      forceInspectorStop();
      break;
    case "extension-reload-content":
      relayMessageToExtension({
        type: "reload-active-tab",
        data: tab?.id as number,
        target: "background",
      });
      //   return true;
      break;
    default:
      console.warn(`Unexpected message type received: '${message.action}'.`);
      return false;
  }
}

function forceInspectorStop() {
  try {
    if (isInspectorActive) {
      Inspector.deactivate();
      isInspectorActive = false;
      relayMessageToExtension({
        type: "onload-script-inspector-status",
        data: {
          active: isInspectorActive,
        },
      });
    }
  } catch (e) {
    throw new Error("InspectorErr");
  }
}
function sendTreeData() {
  if (typeof document !== "undefined") {
    relayMessageToExtension({
      type: "update-gentree-state",
      data: createTreeNodes(document.documentElement),
    });
  }
}
function relayMessageToExtension(options: IRelayMessageOptions): void {
  const { type, data, target = "runtime" } = options;
  chrome.runtime.sendMessage({
    action: type,
    target,
    data,
  });
}
