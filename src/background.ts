chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: "OFF" });
});

chrome.runtime.onMessage.addListener(async (tab) => {
  console.log("background-tab message", tab);
  // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  // Next state will always be the opposite
  const nextState = prevState === "ON" ? "OFF" : "ON";
  console.log(nextState, prevState);

  // Set the action badge to the next state
  await chrome.action.setBadgeText({
    tabId: tab.id,
    text: nextState,
  });
  if (nextState === "ON") {
    // Insert the CSS file when the user turns the extension on
    await chrome.scripting.insertCSS({
      files: ["./styles/styles.css"],
      target: { tabId: tab.id },
    });
  }
});

chrome.action.onClicked.addListener(() => {
  showReadme();
});

function showReadme() {
  chrome.tabs.create({ url: "/index.html" });
}
