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
  return 0;
}
//the above output should be sent to sidepanel
//type is basically the definition of the kind("type") of messages
//time is essentially the data which is being sent
chrome.runtime.sendMessage({
  type: "READING_TIME",
  time: readingTime(),
});
