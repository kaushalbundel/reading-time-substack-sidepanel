// creating a function that generates the reading time of the article
// unoptimized reading time code
// function readingTime() {
//   const article = document.querySelector("article");
//   if (article) {
//     // select the complete text
//     const articleText = article.textContent;
//     // selecting all the words, without the spaces
//     const regExpression = /\b\w+\b/g; // does not select white space character(just selects the words present in the article)
//     // matching the complete text
//     const wordList = articleText.match(regExpression);
//     // above code produces an iterator, convert to a list and then get the length
//     const wordLength = wordList ? wordList.length : 0;
//     // calculate reading time
//     const readingTime = Math.round(wordLength / 200);
//     // returning the reading time
//     return readingTime;
//   }
//   console.warn("No <article> tags found on the article.");
//   return 0;
// }

//optimized code for readingtime function
function readingTime() {
  const article = document.querySelector("article");
  if (!article) {
    console.warn("No <article> tags found on the page");
  }
  const articleText = article.textContent;
  //optimized approach removing regex earlier and introducing built-in js methods
  const words = articleText
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .filter((word) => word.length > 0);
  const wordCount = words.length;
  const readingTime = Math.round(wordCount / 200);
  return readingTime;
}

// instead of waiting for the message we now send it immediately when the tab changes for the specific tab where user has arrived
async function sendReadingTime() {
  try {
    const time = readingTime();
    console.log("calculated reading time", time);
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

//sending reading time when first the substack page opens and then the extension gets loaded
//concerning ISSUE: Reading time is on the refresh not when the extension is activated on the substack page
window.addEventListener("calculateReadingTime", () => {
  console.log("manual reading time calculation triggered");
  sendReadingTime();
});

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

  //cleanup on page reload
  window.addEventListener("pagehide", () => {
    observer.disconnect();
    if (window.readingTimeTimeout) {
      clearTimeout(window.readingTimeTimeout);
    }
  });
}

//start the observer
initializeContentObserver();

document.addEventListener("DOMContentLoaded", () => {
  sendReadingTime();
});
