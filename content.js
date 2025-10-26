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
  // Provide the current state of localize settings (e.g. Autotranslation)
  if (request && request.type === 'getLocalizeSettings') {
    try {
      // Wrap Wix.Styles.getStyleParams in a Promise to use then/catch
      new Promise(Wix.Styles.getStyleParams)
        .then((res) => {
          // Determine the autotranslation flag. If the property is missing,
          // default to true (on).
          let on = true;
          if (res && res.booleans && typeof res.booleans.autotranslation !== 'undefined') {
            on = res.booleans.autotranslation !== 'off';
          }
          sendResponse({ autotranslation: on });
        })
        .catch(() => {
          // On error, default to on
          sendResponse({ autotranslation: true });
        });
      return true; // Indicate asynchronous response
    } catch (err) {
      sendResponse({ autotranslation: true });
    }
  }
  }
  // Returning true is a best practice when sendResponse is used asynchronously.
  return true;
});