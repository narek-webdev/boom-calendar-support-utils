// Content script for Boom Calendar Checker extension
// Listens for messages from the extension popup and inspects
// the current page to see if a Boom Calendar iframe is present.

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Only respond to our specific check message
  if (request && request.type === 'checkCalendar') {
    try {
      const iframes = document.getElementsByTagName('iframe');
      let found = false;
      for (const iframe of iframes) {
        const src = iframe.src || '';
        // The Boom Calendar widget always loads from this URL prefix
        if (src.startsWith('https://calendar.boomte.ch/')) {
          found = true;
          break;
        }
      }
      sendResponse({ present: found });
    } catch (err) {
      // In the unlikely event of an error, default to not present
      sendResponse({ present: false });
    }
  }
  // Returning true is a best practice when sendResponse is used asynchronously.
  return true;
});