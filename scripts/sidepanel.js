//debug: if side panel script is loading
console.log("sidepanel script loaded");

// // listen to the content script for the side panel information
// const port = chrome.runtime.connect({ name: "side-panel" });

// //listen to message from the content script
// port.onMessage.addListener((message) => {
//   //debug
//   console.log("message recieved", message);
//   if (message.type === "READING_TIME") {
//     const timeElement = document.getElementById("reading-time");
//     timeElement.textContent = `${message.time} mins.`;
//   }
// });

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
