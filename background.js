// background.js

chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: chrome.runtime.getURL("manager.html") });
  });
  
  // Handle bookmark operations (same as before)
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "saveBookmark") {
      saveBookmark(message.url, message.domain, message.linkText, sendResponse);
      return true;
    }
    if (message.action === "removeBookmark") {
      removeBookmark(message.domain, message.linkText, sendResponse);
      return true;
    }
    if (message.action === "removeCategory") {
      removeCategory(message.domain, sendResponse);
      return true;
    }
  });
  
  // Bookmark management functions (same as before)
  function saveBookmark(url, domain, linkText, callback) {
    chrome.storage.sync.get("bookmarks", (data) => {
      const bookmarks = data.bookmarks || {};
      if (!bookmarks[domain]) bookmarks[domain] = [];
      if (!bookmarks[domain].some((item) => item.linkText === linkText)) {
        bookmarks[domain].push({ url, linkText });
      }
      chrome.storage.sync.set({ bookmarks }, callback);
    });
  }
  
  function removeBookmark(domain, linkText, callback) {
    chrome.storage.sync.get("bookmarks", (data) => {
      const bookmarks = data.bookmarks || {};
      if (bookmarks[domain]) {
        bookmarks[domain] = bookmarks[domain].filter((item) => item.linkText !== linkText);
        if (bookmarks[domain].length === 0) delete bookmarks[domain];
        chrome.storage.sync.set({ bookmarks }, callback);
      }
    });
  }
  
  function removeCategory(domain, callback) {
    chrome.storage.sync.get("bookmarks", (data) => {
      const bookmarks = data.bookmarks || {};
      delete bookmarks[domain];
      chrome.storage.sync.set({ bookmarks }, callback);
    });
  }
  