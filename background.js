//opens the side panel manually
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

//sending message from content script to the side panel
// this api call transfers the "time to read" information by the content.js to the sidepanel.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "Reading_TIME") {
    chrome.runtime.sendMessage(message);
  }
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

// helper function to control side panel visibility
async function managesSidepanel(tab) {
  // start here
  // If no tab or no url, close the side panel
  if (!tab || !tab.url) {
    await chrome.sidePanel.close();
    return;
  }

  //checking a substack url
  if (isSubstackUrl(tab.url)) {
    //open side panel
    await chrome.sidePanel.open({ windowId: tab.windowId });
  } else {
    await chrome.sidePanel.close();
  }
}

// executing on tab changes
// listen for tab activation changes(when user switches tabs)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  //get new active tab
  const tab = await chrome.tabs.get(activeInfo.tabId);
  await managesSidepanel(tab);
});

//listening to url change when new tab is activated
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  //only act if url is changed and is the active tab
  if (changeInfo.url) {
    //check for active tab
    const activeTabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (activeTabs[0].id === tabId) {
      await managesSidepanel(tab);
    }
  }
});
