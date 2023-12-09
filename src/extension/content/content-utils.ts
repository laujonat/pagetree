import { MessageTarget } from "../../constants";
import { IRelayMessageOptions } from "../../types";

export function waitForDOMReady(callback) {
  let timer;
  const observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      observer.disconnect();
      callback();
    }, 500); // Adjust the timeout to suit the page's load characteristics
  });
  console.log("wait dom ready");
  observer.observe(document, {
    childList: true,
    subtree: true,
  });
}

export function relayMessageToExtension(options: IRelayMessageOptions): void {
  const { type, data, target = MessageTarget.Runtime } = options;
  chrome.runtime.sendMessage({
    action: type,
    target,
    data,
  });
}
