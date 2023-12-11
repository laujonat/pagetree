import { MessageContent, MessageTarget } from "../../constants";
import { IMessage } from "../../types";
import { createTreeNodes } from "../../utils/treenode";
import { Inspector as InspectorScript } from "../scripts/inspector";
import { relayMessageToExtension, waitForDOMReady } from "./content-utils";

type InspectorInstance = {
  instance: InspectorScript | undefined;
};
const Inspector: InspectorInstance = { instance: undefined };

let previousObserver;
let lastRightClickedElement: Element;
let DOMRoot: Element;
let previousDOMRoot: Element;
let treeData;

const port = chrome.runtime.connect({ name: "pagetree-panel-extension" });
console.info("pagetree-connect", port);

chrome.runtime.onMessage.addListener(handleSidepanelMessages);

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
      DOMRoot = startObserver(targetElement);
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
  console.log("content script action", message.action);

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
    case MessageContent.reloadDomTree:
      console.warn("reloading dom", DOMRoot);
      treeData = createTreeNodes(DOMRoot);
      relayMessageToExtension({
        type: MessageContent.updateGenTree,
        data: treeData,
      });
      DOMRoot = startObserver(DOMRoot);
      break;
    case MessageContent.highlightTextOption:
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
        if (Inspector.instance?.isActiveStatus) {
          // Inspector is active, store the previous DOM state
          previousDOMRoot = DOMRoot;
        }
        toggleInspector();
        relayMessageToExtension({
          type: MessageContent.updateGenTree,
          data: treeData,
        });
        if (!Inspector.instance?.isActiveStatus) {
          // Inspector is not active, update the observer
          DOMRoot = startObserver(element);
        }
      } else {
        console.error("No selected element to process");
      }
      break;
    case MessageContent.inspectorToggle:
      if (!Inspector.instance?.isActiveStatus) {
        // Inspector is not active, update the observer
        if (previousDOMRoot) {
          DOMRoot = startObserver(previousDOMRoot);
        } else {
          DOMRoot = startObserver(document.documentElement);
        }
      }
      toggleInspector();
      break;
    case MessageContent.inspectorStatus:
      console.log("checking status", Inspector.instance?.isActiveStatus);
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
      console.log("I called deactivated..");
    } else {
      if (!Inspector.instance) {
        Inspector.instance = new InspectorScript();
      }
      Inspector.instance.activate();
      relayMessageToExtension({
        type: MessageContent.inspectorBadgeActivate,
        target: MessageTarget.Background,
      });
    }
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
  try {
    if (Inspector.instance && Inspector.instance.isActiveStatus) {
      Inspector.instance.deactivate();
      delete Inspector.instance;
      relayMessageToExtension({
        type: MessageContent.inspectorStatus,
        data: {
          active: Boolean(Inspector.instance),
        },
      });
    }
  } catch (e) {
    throw new Error("InspectorErr");
  }
}

function sendTreeData() {
  if (typeof document !== "undefined") {
    if (!DOMRoot) {
      if (lastRightClickedElement) {
        DOMRoot = startObserver(lastRightClickedElement);
      } else {
        DOMRoot = startObserver(document.documentElement);
      }
    }
    console.log("DOMROOT", DOMRoot);
    treeData = createTreeNodes(DOMRoot);
    relayMessageToExtension({
      type: MessageContent.updateGenTree,
      data: treeData,
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handleMutations(mutationsList, observer) {
  if (Inspector.instance?.isActiveStatus) {
    return;
  }
  relayMessageToExtension({
    type: MessageContent.domChangesDetected,
    target: MessageTarget.Runtime,
  });
}

function startObserver(dom) {
  try {
    // Check if there is a previous observer and disconnect it if exists
    if (previousObserver) {
      previousObserver.disconnect();
    }

    const observer = new MutationObserver(handleMutations);

    const config = {
      childList: true, // Watch for changes in child elements
      subtree: true, // Watch all descendant elements
    };

    observer.observe(dom, config);
    previousObserver = observer;
  } catch (error) {
    console.error(error);
  }
  return dom;
}
