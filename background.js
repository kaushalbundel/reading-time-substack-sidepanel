// use session storage to keep track of active tabs for the current browser session
const TABS_STORAGE_KEYS = "activeSidePanelTabs";

// helper function to get active tabs from storage
async function getActiveTabs() {
    // getting the key from chrome storage
    const result = await chrome.storage.session.get([TABS_STORAGE_KEYS]);
    return result[TABS_STORAGE_KEYS] || {};
}

// helper function to set active tabs from storage
// TODO Is this setting an active tab or tab information of all the tabs in a specific window
async function setActiveTabs(tabs) {
    await chrome.storage.session.set({ [TABS_STORAGE_KEYS]: tabs });
}

// Event listeners

// Listen to clicks on the extension icon and either adds or remove the side panel from the window
chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id) return;

    const activeTabs = await getActiveTabs();

    //toggles the state of the current tab
    if (activeTabs[tab.id]) {
        // deactivate this tab
        delete activeTabs[tab.id];
        console.log(`Deactivating the side panel for the tab ${tab.id}`);
        //disabling the sidepanel
        await chrome.sidePanel.setOptions({
            tabId: tab.id,
            enabled: false,
        });
    } else {
        // activate this tab
        activeTabs[tab.id] = true;
        console.log(`sidepanel activated for the tab: ${tab.id}`);
        //Enable side panel for this tab
        await chrome.sidePanel.setOptions({
            tabId: tab.id,
            enabled: true,
        });
        // open the side panel for window associated with this tab
        await chrome.sidePanel.open({ tabID: tab.id });
        //optionally the icon can be activated to show that it is active
    }
});

// Listens for tab switches (activation change)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tabId = activeInfo.tabId;
    const activeTabs = await getActiveTabs();

    console.log(`tab id ${tabId} activated`);

    if (activeTabs[tabId]) {
        console.log(`Enabling panel for the activated tab ${tabId}`);
        await chrome.sidePanel.setOptions({
            tabId: tabId,
            enabled: true,
            path: "sidepanel.html",
        });
        //if the side panel was open, then the above code is fine otherwise open the sidepanel through below
        // await chrome.sidePanel.open({ tabId: tabId});
    } else {
        console.log(`Disabling side panel for the activated tab ${tabId}`);
        await chrome.sidePanel.setOptions({
            tabId: tabId,
            enabled: false,
        });
    }
});

// Listens for tab closure. Clean up in case tabs are closed
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
    const activeTabs = await getActiveTabs();
    if (activeTabs[tabId]) {
        delete activeTabs[tabId];
        await setActiveTabs(activeTabs);
        console.log(`Removed closed tabs ${tabId} from active list.`);
    }
});

// Set initial state from extension install/update
chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === "install") {
        await chrome.storage.session.remove(TABS_STORAGE_KEYS);
        console.log("Extension Installed, Storage cleared");
    }
    // initialize side panel state for all existing install/update
    const allTabs = await chrome.tabs.query({});
    const activeTabs = await getActiveTabs();
    for (const tab of allTabs) {
        if (tab.id) {
            await chrome.sidePanel.setOptions({
                tabId: tab.id,
                enabled: activeTabs[tab.id] || false,
                path: 'sidepanel.html'
            });
        }
    }
});
