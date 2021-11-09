import { marked } from "marked";
const getMarkdownString = async (url: string) => {
  return fetch(url)
    .then((response) => response.text())
    .then((text) => {
      return text;
    })
    .catch((error) => {
      console.log(error);
      return "";
    });
};
chrome.browserAction.onClicked.addListener(async function (tab) {
  const URL =
    "https://raw.githubusercontent.com/bradtraversy/design-resources-for-developers/master/readme.md";
  const markdownString: string = await getMarkdownString(URL);

  marked.Parser.parse(markdownString, {});
  chrome.tabs.executeScript(null, {
    file: "content.js",
  });
});
