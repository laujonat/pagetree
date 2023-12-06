import { MessageContent, MessageTarget } from "../constants";
import { IMessage, IRelayMessageOptions } from "../types";
import { createTreeNodes } from "../utils/genTreeNodesHelper";
import { Inspector as InspectorScript } from "./scripts/inspector";

type InspectorInstance = {
  instance: InspectorScript | undefined;
};

let treeData;
const Inspector: InspectorInstance = { instance: undefined };
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
  // Return early if this message isn't meant for the sidepanel document.
  if (message.target !== MessageTarget.Sidepanel) {
    return false;
  }

  const { tab } = sender;
  // Dispatch the message to an appropriate handler.
  switch (message.action) {
    case MessageContent.checkDocStatus:
      console.log("checking document status");
      waitForDOMReady(() => {
        relayMessageToExtension({
          type: MessageContent.bgDocStatus,
          data: { isDocumentAvailable: true },
          target: MessageTarget.Background,
        });
      });
      break;
    case MessageContent.fetchActiveTabUrl:
      relayMessageToExtension({
        type: MessageContent.bgFetchActiveTabUrl,
        target: MessageTarget.Background,
      });
      break;
    case MessageContent.activeTabUrl:
      relayMessageToExtension({
        type: MessageContent.activeTabUrl,
        data: { url: message.data.url },
      });
      break;
    case MessageContent.checkFirstTime:
      // Check if it's the first time opening the extension
      chrome.storage.sync.get(["colorschemeScriptRun"], (result) => {
        const colorschemeScriptRun = result.colorschemeScriptRun || false;
        if (!colorschemeScriptRun) {
          chrome.storage.sync.set({ colorschemeScriptRun: true });
        }
        const perfersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        relayMessageToExtension({
          type: MessageContent.firstTimeResponse,
          target: MessageTarget.Runtime,
          data: {
            dark: perfersDark ? "enabled" : "disabled",
            firstTime: !colorschemeScriptRun,
          },
        });
      });
      break;
    case MessageContent.scanPage:
      sendTreeData();
      break;
    case MessageContent.resendScanPage:
      sendTreeData();
      break;
    case MessageContent.highlightTextOption:
      console.log(lastRightClickedElement);
      treeData = createTreeNodes(lastRightClickedElement);
      relayMessageToExtension({
        type: MessageContent.updateGenTree,
        data: treeData,
      });
      break;
    case MessageContent.fullPageOption:
      treeData = createTreeNodes(document.documentElement);
      relayMessageToExtension({
        type: MessageContent.updateGenTree,
        data: treeData,
      });
      break;
    case MessageContent.inspectorSelect:
      if (message.data) {
        const element = document.querySelector(message.data);
        treeData = createTreeNodes(element);
        relayMessageToExtension({
          type: MessageContent.openSidePanel,
          target: MessageTarget.Background,
        });
        toggleInspector();
        relayMessageToExtension({
          type: MessageContent.updateGenTree,
          data: treeData,
        });
      } else {
        console.error("No selected element to process");
      }
      break;
    case MessageContent.inspectorToggle:
      toggleInspector();
      break;
    case MessageContent.inspectorStatus:
      relayMessageToExtension({
        type: MessageContent.inspectorStatus,
        data: {
          active: Inspector.instance?.isActiveStatus,
        },
        target: MessageTarget.Runtime,
      });
      break;
    case MessageContent.inspectorForceStop:
      console.log("Force deactivate inspector", sender);
      forceInspectorStop();
      break;
    case MessageContent.reloadExtension:
      relayMessageToExtension({
        type: MessageContent.reloadActiveTab,
        data: tab?.id as number,
        target: MessageTarget.Background,
      });
      break;
    default:
      console.warn(`Unexpected message type received: '${message.action}'.`);
      return false;
  }
}

function toggleInspector() {
  try {
    if (Inspector.instance && Inspector.instance.isActiveStatus) {
      Inspector.instance.deactivate();
    } else {
      if (!Inspector.instance) {
        Inspector.instance = new InspectorScript();
      }
      Inspector.instance.activate();
    }
    relayMessageToExtension({
      type: MessageContent.inspectorBadgeActivate,
      target: MessageTarget.Background,
    });
    relayMessageToExtension({
      type: MessageContent.inspectorStatus,
      data: {
        active: Inspector.instance?.isActiveStatus,
      },
    });
  } catch (e) {
    forceInspectorStop();
    throw new Error("InspectorErr");
  }
}

function forceInspectorStop() {
  console.log("forcing stop");
  try {
    if (Inspector.instance && Inspector.instance.isActiveStatus) {
      Inspector.instance.deactivate();
      relayMessageToExtension({
        type: MessageContent.inspectorStatus,
        data: {
          active: Inspector.instance.isActiveStatus,
        },
      });
    }
  } catch (e) {
    throw new Error("InspectorErr");
  }
}

function sendTreeData() {
  if (typeof document !== "undefined") {
    if (!treeData) {
      treeData = createTreeNodes(document.documentElement);
    }
    relayMessageToExtension({
      type: MessageContent.updateGenTree,
      data: treeData,
    });
  }
}

function relayMessageToExtension(options: IRelayMessageOptions): void {
  const { type, data, target = MessageTarget.Runtime } = options;
  chrome.runtime.sendMessage({
    action: type,
    target,
    data,
  });
}
