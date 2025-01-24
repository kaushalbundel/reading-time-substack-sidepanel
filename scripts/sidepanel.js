chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "READING_TIME") {
    const timeElement = document.getElementById("reading-time");
    timeElement.textContent = `${message.time} mins.`;
  }
});
