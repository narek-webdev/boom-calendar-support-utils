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
  if (request && request.type === "checkCalendar") {
    try {
      // Wrap Wix.Styles.getStyleParams in a Promise to use then/catch
      new Promise(window.Wix.Styles.getStyleParams)
        .then((res) => {
          // Determine the autotranslation flag. The API may return either
          // a booleans property or direct properties. If the property is missing,
          // default to true (on).
          console.log(res);
          return;
          let on = true;
          if (res) {            
            // Case 1: top-level boolean property
            if (typeof res.autotranslation !== 'undefined') {
              on = !!res.autotranslation;
            } else if (res.booleans && typeof res.booleans.autotranslation !== 'undefined') {
              // Case 2: booleans.autotranslation exists (value is boolean)
              on = !!res.booleans.autotranslation;
            }
          }
          sendResponse({ autotranslation: on });
        })
        .catch(() => {
          // On error, default to on
          sendResponse({ autotranslation: true });
        });
      return true; // Indicate asynchronous response
    } catch (err) {
      console.log(err);
      
      sendResponse({ autotranslation: true });
    }
  }
  }
  // Returning true is a best practice when sendResponse is used asynchronously.
  return true;
});