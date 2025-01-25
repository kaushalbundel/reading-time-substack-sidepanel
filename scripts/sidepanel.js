//storing the current tab url
let currentUrl = "";

//initialize notes from chrome storage as the panel opens
document.addEventListener("DOMContentLoaded", async () => {
  // get the current tab url
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  currentUrl = tabs[0].url;

  //load saved notes for this url
  const results = await chrome.storage.local.get(currentUrl);
  const savedNotes = results[currentUrl] || "";
  document.getElementById("notes-textarea").value = savedNotes;
});

// listen to message from the background scripts and shows it on the side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("side panel recieved message", message);
  if (message.type === "READING_TIME") {
    const timeElement = document.getElementById("reading-time");
    if (timeElement) {
      timeElement.textContent = `Reading time: ${message.time} mins`;
    } else {
      console.error("reading time not found in the side panel");
    }
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
