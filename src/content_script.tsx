import Inspector from "./inspector";
import { IMessage, IRelayMessageOptions } from "./types";
import { createTreeNodes } from "./utils/d3node";

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

async function handleSidepanelMessages(
  message: IMessage,
  sender: chrome.runtime.MessageSender,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  sendResponse: (response?: any) => void
) {
  // Return early if this message isn't meant for the sidepanel document.
  if (message.target !== "sidepanel") {
    return false;
  }

  const { tab } = sender;
  // Dispatch the message to an appropriate handler.
  switch (message.action) {
    case "check-document-status":
      forceInspectorStop();
      relayMessageToExtension({
        type: "document-status-response",
        data: {
          isDocumentAvailable:
            typeof document !== "undefined" &&
            document.readyState === "complete",
        },
        target: "background",
      });
      break;
    case "toggle-dark-mode":
      chrome.storage.sync.set({ darkMode: "enabled" }).then(() => {
        document.body.classList.add("dark-mode");
      });
      break;
    case "extension-scan-page":
      if (typeof document !== "undefined") {
        relayMessageToExtension({
          type: "update-gentree-state",
          data: createTreeNodes(document.documentElement),
        });
      }
      break;
    case "process-selected-element-context":
      console.warn("lastselectedcontext", lastRightClickedElement);
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
          data: isInspectorActive,
        });
      } catch (e) {
        forceInspectorStop();
        throw new Error("InspectorErr");
      }
      break;
    case "extension-inspector-status":
      console.warn("checking inspector status");
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

function relayMessageToExtension(options: IRelayMessageOptions): void {
  const { type, data, target = "runtime" } = options;
  chrome.runtime.sendMessage({
    action: type,
    target,
    data,
  });
}
