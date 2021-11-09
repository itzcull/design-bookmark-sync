import { marked } from 'marked';

const BOOKMARKS_ROOT_ID = '1';
const URL =
  'https://raw.githubusercontent.com/bradtraversy/design-resources-for-developers/master/readme.md';

const getResourceText = async (url: string) => {
  return fetch(url)
    .then((response) => response.text())
    .catch((error) => {
      console.log(error);
      return '';
    });
};

const createFolder = async (
  title: string,
  parentId: string
): Promise<string> => {
  const id = await chrome.bookmarks
    .create({
      title: title,
      parentId: parentId,
    })
    .then((result) => result.id)
    .catch((error) => {
      console.log(error);
      return '';
    });
  return id;
};

const createBookmark = async (folderId: string, title: string, url: string) => {
  const id = await chrome.bookmarks
    .create({
      parentId: folderId,
      title: title,
      url: url,
    })
    .then((result) => {
      console.log(`Added ( ${title} : ${url} ) under folder id: ${folderId}`);
      return result.id;
    })
    .catch((error) => {
      console.log(error);
      return '';
    });
  return id;
};

chrome.action.onClicked.addListener(async function (tab: chrome.tabs.Tab) {
  console.log('Fetching Traversey Design Resources...');
  const markdownString: string = await getResourceText(URL);

  // Parse markdown for design resources
  const markdownTokens = marked.lexer(markdownString);

  // Ensure that the 'Traversey Resources' folder exists, or create it. Return the folder ID
  const parentFolderId: string = (await chrome.bookmarks
    .search({ title: 'Traversey Design' })
    .then(async (results) => {
      // If folder exists
      if (results.length > 0) {
        await chrome.bookmarks
          .removeTree(results[0].id)
          .then(() => console.log('Successfully removed old data.'))
          .catch((error) => {
            console.log(error);
          });

        return chrome.bookmarks
          .create({
            title: 'Traversey Design',
            parentId: BOOKMARKS_ROOT_ID,
          })
          .then((node) => {
            console.log('Successfully created new parent folder.');
            return node.id;
          });
      } else {
        return chrome.bookmarks
          .create({
            title: 'Traversey Design',
            parentId: BOOKMARKS_ROOT_ID,
          })
          .then((node) => node.id);
      }
    })) as string;

  console.log('Parent Folder ID: ' + parentFolderId);

  // Some variables to keep track of state in the loop
  const shared = { folderId: '', flag: false };

  // Loop through parsed markdown elements
  for (const token of markdownTokens) {
    if (token.type === 'heading' && token.depth === 2) {
      // Not interested in this heading
      if (token.text === 'Table of Contents') continue;

      shared.folderId = await createFolder(token.text, parentFolderId);
      shared.flag = true;
    }

    if (token.type === 'table' && shared.flag) {
      // Add bookmarks for given category
      token.rows.forEach(async (tableCells: marked.Tokens.TableCell[]) => {
        const title: string = (tableCells[0].tokens[0] as marked.Tokens.Link)
          .text;
        const url: string = (tableCells[0].tokens[0] as marked.Tokens.Link)
          .href;
        createBookmark(shared.folderId, title, url);
      });
      shared.flag = false;
    }
  }
  chrome.action.setIcon({ path: 'assets/trav_logo_tick.png' });
});
