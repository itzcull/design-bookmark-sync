import { marked } from 'marked';

const getResourceText = async (url: string) => {
  return fetch(url)
    .then((response) => response.text())
    .catch((error) => {
      console.log(error);
      return '';
    });
};

chrome.action.onClicked.addListener(async function (tab: chrome.tabs.Tab) {
  const URL =
    'https://raw.githubusercontent.com/bradtraversy/design-resources-for-developers/master/readme.md';
  const markdownString: string = await getResourceText(URL);

  console.log('Fetching Traversey Resources');
  marked.parse(markdownString, {});
});
