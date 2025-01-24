//opens the side panel manually
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

//opens the side panel automatically when a substack url is loaded
//Issue: chrome does not allow side panel to open programmitically

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (changeInfo.status === "complete" && tab.url.includes("substack.com")) {
//     chrome.sidePanel.open({ windowId: tab.windowId });
//   }
// });

//sending message from content script to the side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "Reading_TIME") {
    chrome.runtime.sendMessage(message);
  }
});
