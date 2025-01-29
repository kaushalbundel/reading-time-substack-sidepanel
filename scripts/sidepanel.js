//storing the current tab url
let currentTabId = "";

//initialize notes from chrome storage as the panel opens
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // get the current tab url
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs && tabs[0]) {
      currentTabId = tabs[0].id;
      currentUrl = tabs[0].url;

      //load saved notes for this url
      const results = await chrome.storage.local.get(currentUrl);
      const savedNotes = results[currentUrl] || "";
      document.getElementById("notes-textarea").value = savedNotes;
    }
  } catch (error) {
    console.error("Error initializing sidepanel:", error);
  }
});

// listen for tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  currentTabId = activeInfo.TabId;
});

// listen to message from the background scripts and shows it on the side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    console.log("side panel recieved message", message);
    if (
      message.type === "READING_TIME" &&
      message.source === "background" &&
      message.tabId === currentTabId
    ) {
      const timeElement = document.getElementById("reading-time");
      if (timeElement) {
        timeElement.textContent = `Reading time: ${message.time} mins`;
      } else {
        console.error("reading time not found in the side panel");
      }
    }
  } catch (error) {
    console.error("error processing message", error);
  }
});

//save notes as they are typed
const notesTextArea = document.getElementById("notes-textarea");
notesTextArea.addEventListener("input", async (e) => {
  await chrome.storage.local.set({
    [currentUrl]: e.target.value,
  });
});

//handling copying notes
const copyButton = document.getElementById("copy-button");
const copyFeedback = document.getElementById("copy-feedback");

copyButton.addEventListener("click", async () => {
  //get current notes
  const notes = notesTextArea.value;

  //format the copied text
  const textToCopy = `Notes from: ${currentUrl}\n\n${notes}`;

  try {
    //copy to clipboard
    await navigator.clipboard.writeText(textToCopy);

    //show feedback
    copyFeedback.style.display = "inline";
    setTimeout(() => {
      copyFeedback.style.display = "none";
    }, 2000);
  } catch (err) {
    console.error("fail to copy", err);
    copyFeedback.textContent = "Failed to copy";
    copyFeedback.style.color = "red";
    copyFeedback.style.display = "inline";
  }
});
