//opens the side panel manually and triggering the event to populate the reading time
chrome.action.onClicked.addListener(async (tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });

  // if substack url then immediately trigger the reading time
  if (isSubstackUrl(tab.url)) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          window.dispatchEvent(new CustomEvent("CalculateReadingTime"));
        },
      });
    } catch (error) {
      console.log("Error triggering time calculations: ", error);
    }
  }
});

//storing reading times for multiple tabs
const tabReadingTimes = new Map();
// sending message from content script to the side panel
// this api call transfers the "time to read" information by the content.js to the sidepanel.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background message received", message);
  if (message.type === "READING_TIME" && sender.tab) {
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

    sendResponse({ received: true });
  }
  return false;
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
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes("substack.com");
  } catch {
    return false;
  }
}

//allows user to open the side panel by clicking on the action tool bar
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") return;
  //enabling side panel
  if (isSubstackUrl(tab.url)) {
    await chrome.sidePanel.setOptions({
      tabId,
      path: "sidepanel.html",
      enabled: true,
    });
    //inject content script
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["scripts/content.js"],
    });
  } else {
    //disables side panel
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: false,
    });
  }
});

// handle tab activation changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (isSubstackUrl(tab.url)) {
      // get stored reading time for this specific tab
      const readingTimeData = tabReadingTimes.get(activeInfo.tabId);
      if (readingTimeData) {
        chrome.runtime.sendMessage({
          type: "READING_TIME",
          ...readingTimeData,
          source: "background",
        });
      }
    }
  } catch (error) {
    console.error("error handling tab activation", error);
  }
});
