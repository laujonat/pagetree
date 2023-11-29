import { createTreeNodes } from "./utils/d3node";

interface IMessage {
  target: "sidepanel" | "popup";
  action: string;
  data: object;
}

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
// const serializer = new XMLSerializer();
async function handleSidepanelMessages(
  message: IMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse
) {
  // Return early if this message isn't meant for the offscreen document.
  if (message.target !== "sidepanel") {
    return false;
  }

  const { tab } = sender;
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
      console.warn("extensionscanpage");
      sendResponse({ data: createTreeNodes(document.documentElement) });
      break;
    case "extension-scan-element":
      console.info(lastRightClickedElement);
      sendResponse({ data: createTreeNodes(lastRightClickedElement) });
      break;
    case "process-selected-element-context":
      console.warn("lastselectedcontext", lastRightClickedElement);
      relayMessageToExtension(
        "process-context-menu-selection",
        createTreeNodes(lastRightClickedElement)
      );
      break;
    case "process-selected-page-context":
      console.warn("pageContext", document.documentElement);
      relayMessageToExtension(
        "process-context-menu-selection",
        createTreeNodes(document.documentElement)
      );
      break;
    // case "extension-active-inspector":
    //   console.warn("pageContext", document.documentElement);
    //   if (tab?.id) {
    //     chrome.scripting
    //       .executeScript({
    //         target: { tabId: tab.id as number },
    //         func: addIframe,
    //       })
    //       .then((injectionResults) => {
    //         for (const frameResult of injectionResults) {
    //           const { frameId, result } = frameResult;
    //           console.log(`Frame ${frameId} result:`, result);
    //         }
    //       });
    //   }
    //   break;
    case "extension-reload-content":
      console.log("here-reload, ", sender);
      relayMessageToExtension(
        "reload-active-tab",
        tab?.id as number,
        "background"
      );

      break;
    default:
      console.warn(`Unexpected message type received: '${message.action}'.`);
      return false;
  }
}

function relayMessageToExtension(type, data, target = "runtime") {
  chrome.runtime.sendMessage({
    action: type,
    target,
    data,
  });
}
