//opens the side panel manually
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

//storing reading times for multiple tabs
const tabReadingTimes = new Map();
// sending message from content script to the side panel
// this api call transfers the "time to read" information by the content.js to the sidepanel.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "Reading_TIME" && sender.tab) {
    // storing reading times for a specific tab
    tabReadingTimes.set(sender.tab.id, {
      time: message.time,
      url: message.url,
    });

    // forwarding the tab wise messages
    chrome.runtime.sendMessage({
      type: "READING_TIME",
      time: message.time,
      source: "background",
      tabId: sender.tab.id,
      url: message.url,
    });
  }
});

//cleanup when the tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  tabReadingTimes.delete(tabId);
});

//side panel closing and opening on the basis of tab and url change
// - The extension needs to monitor the tab change
//   - If the tab is changed and is substack url, then open the sidepanel
//   - If the tab is changed and is not a substack url, the close the sidepanel
// - On the basis of tab url, activate/deactivate the side panel
//   - If the url is changed and is substack url, then open the sidepanel
//   - If the url is changed and is not a substack url, the close the sidepanel

// Monitoring tab change
// helper function to check if a url is a substack url
function isSubstackUrl(url) {
  return url && url.includes("substack.com");
}

//allows user to open the side panel by clicking on the action tool bar
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;
  const url = new URL(tab.url);
  //enabling side panel
  if (url.orgin.includes("substack.com")) {
    await chrome.sidePanel.setOptions({
      tabId,
      path: "sidepanel.html",
      enabled: true,
    });
  } else {
    //disables side panel
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: false,
    });
  }
});
