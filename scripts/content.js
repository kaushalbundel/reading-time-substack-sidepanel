// creating a function that generates the reading time of the article

function readingTime() {
  const article = document.querySelector("article");
  if (article) {
    // select the complete text
    const articleText = article.textContent;
    // selecting all the words, without the spaces
    const regExpression = /\b\w+\b/g; // does not select white space character(just selects the words present in the article)
    // matching the complete text
    const wordList = articleText.match(regExpression);
    // above code produces an iterator, convert to a list and then get the length
    const wordLength = wordList ? wordList.length : 0;
    // calculate reading time
    const readingTime = Math.round(wordLength / 200);
    // returning the reading time
    return readingTime;
  }
  console.warn("No <article> tags found on the article.");
  return 0;
}
//the above output should be sent to sidepanel
//type is basically the definition of the kind("type") of messages
//time is essentially the data which is being sent
// chrome.runtime.sendMessage({
//   type: "READING_TIME",
//   time: readingTime(),
// });

// //listen to the sidepanel connection

// chrome.runtime.onConnect.addListener((port) => {
//   //debug
//   console.log("connected to side panel");
//   if (port.name === "side-panel") {
//     port.postMessage({
//       type: "READING_TIME",
//       time: readingTime(),
//     });
//   }
// });

// Claude suggestion

// instead of waiting for the message we now send it immediately
async function sendReadingTime() {
  try {
    const time = readingTime();
    chrome.runtime
      .sendMessage({
        type: "READING_TIME",
        time: time,
        source: "content",
        url: window.location.href, //so that if multiple windows have different substack open (with different reading times), the code will send only information for that specific url
      })
      .catch((error) => {
        console.error("Error sending reading time", error);
      });
  } catch (error) {
    console.error("Error in sending reading time:", error);
  }
}
// this code does the following things
// observes for any changes in the page structure (content loads) and then sends the reading time if there is a content load.
// it also stops to send the reading time when the page unloads (ie. url is changed, chrome is shut down etc.)
function initializeContentObserver() {
  //sending reading time
  sendReadingTime();

  const observer = new MutationObserver((mutations) => {
    if (window.readingTimeTimeout) {
      clearTimeout(window.readingTimeTimeout);
    }

    window.readingTimeTimeout = setTimeout(() => {
      sendReadingTime();
    }, 1000);
  });

  //adding config files for the MutationObserver
  const article = document.querySelector("article");
  if (article) {
    observer.observe(article, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  window.addEventListener("unload", () => {
    observer.disconnect();
    if (window.readingTimeTimeout) {
      clearTimeout(window.readingTimeTimeout);
    }
  });
}

initializeContentObserver();
