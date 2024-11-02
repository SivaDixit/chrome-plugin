// popup.js

document.addEventListener("DOMContentLoaded", () => {
    loadBookmarks();
  
    document.getElementById("bookmarkForm").addEventListener("submit", (event) => {
      event.preventDefault();
      let domain = document.getElementById("domainInput").value.trim();
  
      // Ensure the domain does not include 'https://'
      domain = domain.replace(/^https?:\/\//, "");
  
      // Only add the domain if it's not empty
      if (domain) {
        chrome.storage.sync.get("bookmarks", (data) => {
          const bookmarks = data.bookmarks || {};
          if (!bookmarks[domain]) {
            bookmarks[domain] = [];
            chrome.storage.sync.set({ bookmarks }, () => {
              addAccordionForDomain(domain);
            });
          }
        });
      }
    });
  });
  
  function loadBookmarks() {
    chrome.storage.sync.get("bookmarks", (data) => {
      const bookmarksContainer = document.getElementById("bookmarksContainer");
      bookmarksContainer.innerHTML = "";
      const bookmarks = data.bookmarks || {};
  
      for (const domain in bookmarks) {
        if (bookmarks[domain].length > 0) {  // Only add if there are links under the domain
          addAccordionForDomain(domain, bookmarks[domain]);
        }
      }
    });
  }
  
  function addAccordionForDomain(domain, links = []) {
    const bookmarksContainer = document.getElementById("bookmarksContainer");
  
    // Create accordion item
    const domainSection = document.createElement("div");
    domainSection.classList.add("accordion-item");
  
    const header = document.createElement("div");
    header.classList.add("accordion-header");
    header.textContent = domain;
  
    const toggleButton = document.createElement("button");
    toggleButton.classList.add("accordion-toggle");
    toggleButton.textContent = "+";
    toggleButton.addEventListener("click", () => {
      const content = header.nextElementSibling;
      content.classList.toggle("expanded");
      toggleButton.textContent = content.classList.contains("expanded") ? "−" : "+";
    });
  
    header.appendChild(toggleButton);
  
    // "Remove All" button
    const removeCategoryButton = document.createElement("button");
    removeCategoryButton.textContent = "Remove All";
    removeCategoryButton.classList.add("remove-category");
    removeCategoryButton.addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "removeCategory", domain }, loadBookmarks);
    });
    header.appendChild(removeCategoryButton);
  
    domainSection.appendChild(header);
  
    // Accordion content (link list and add-link form)
    const linkList = document.createElement("div");
    linkList.classList.add("accordion-content");
  
    // Input fields to add links within the domain
    const customLabelInput = document.createElement("input");
    customLabelInput.classList.add("custom-label-input");
    customLabelInput.setAttribute("type", "text");
    customLabelInput.setAttribute("placeholder", "Custom label (e.g., Google Search)");
  
    const addLinkInput = document.createElement("input");
    addLinkInput.classList.add("add-link-input");
    addLinkInput.setAttribute("type", "text");
    addLinkInput.setAttribute("placeholder", "Link text (e.g., search?q=example)");
  
    const addLinkButton = document.createElement("button");
    addLinkButton.textContent = "Add Link";
    addLinkButton.classList.add("add-link-button");
    addLinkButton.addEventListener("click", () => {
      const linkText = addLinkInput.value.trim();
      const customLabel = customLabelInput.value.trim();
  
      if (linkText && customLabel) {
        // Construct URL with https:// prefix and domain
        const url = `https://${domain}/${linkText}`;
  
        // Save bookmark with customLabel
        chrome.runtime.sendMessage({ action: "saveBookmark", domain, url, customLabel }, () => {
          addLinkToAccordion(linkList, url, customLabel, domain);
        });
  
        addLinkInput.value = "";
        customLabelInput.value = "";
      }
    });
  
    // Append add-link inputs only to the accordion content section
    linkList.appendChild(customLabelInput);
    linkList.appendChild(addLinkInput);
    linkList.appendChild(addLinkButton);
  
    // Add existing links to the domain section
    links.forEach(({ url, customLabel }) => {
      addLinkToAccordion(linkList, url, customLabel, domain);
    });
  
    domainSection.appendChild(linkList);
    bookmarksContainer.appendChild(domainSection);
  }
  
  function addLinkToAccordion(linkList, url, customLabel, domain) {
    const linkItem = document.createElement("div");
    linkItem.classList.add("link-item");
  
    const linkButton = document.createElement("button");
    linkButton.textContent = customLabel;  // Use custom label as button text
    linkButton.classList.add("link-button");
    linkButton.addEventListener("click", () => window.open(url));
    linkItem.appendChild(linkButton);
  
    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.classList.add("remove-link");
    removeButton.addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "removeBookmark", domain, url }, loadBookmarks);
    });
    linkItem.appendChild(removeButton);
  
    linkList.appendChild(linkItem);
  }
  