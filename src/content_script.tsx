import { scanPage } from "./sum";

console.log("Script run on web page");

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("sender", sender, request);
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  );
  console.log(document.documentElement);
  sendResponse({
    action: "scanPage",
    data: scanPage(document.documentElement),
  });
});

chrome.runtime.onConnect.addListener(function (port) {
  console.log("onconnect content-script", port);
  console.assert(port.name === "knockknock");
  port.onMessage.addListener(function (msg) {
    if (msg.joke === "Knock knock")
      port.postMessage({ question: "Who's there?" });
    else if (msg.answer === "Madame")
      port.postMessage({ question: "Madame who?" });
    else if (msg.answer === "Madame... Bovary")
      port.postMessage({ question: "I don't get it." });
  });
});
