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
    const time = `📖 ${readingTime} mins read`;
    return time;
  }
  return `📖 0 mins read`;
}

// creating another function for displaying reading time

function displayReadingTime() {
  const time = readingTime();
  const readingTimeElement = document.getElementById("reading-time");
  readingTimeElement.textContent = time;
}

displayReadingTime();
