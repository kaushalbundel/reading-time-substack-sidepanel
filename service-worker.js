//specified the origin url where the side panel should be displayed
const SUBSTACK_DOMAIN = ".substack.com";

// Allows the user to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

//opening side panel with the help of listener which opens the tab when the "substack" is visited
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  try {
    if (!tab.url) return; // accessing the tab
    const url = new URL(tab.url);
    //enables the side panel
    if (url.hostname.endsWith(SUBSTACK_DOMAIN)) {
      await chrome.sidePanel.setOptions({
        tabId,
        path: "sidepanel.html",
        enabled: true,
      });
    } else {
      //disables side panel for all other websites
      await chrome.sidePanel.setOptions({
        tabId,
        enabled: false,
      });
    }
  } catch (error) {
    console.log("Error in the sidePanel logic:", error);
  }
});
