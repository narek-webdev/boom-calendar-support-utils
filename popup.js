// Popup script for Boom Calendar Checker
// Queries the active tab and asks the content script whether
// a Boom Calendar iframe is present. Updates the UI accordingly.

/**
 * Set the status message and icon based on whether the calendar is present.
 * @param {boolean} present Whether the calendar iframe was detected.
 */
function setStatus(present) {
  const statusElement = document.getElementById('status');
  const iconElement = document.getElementById('status-icon');
  const sectionsContainer = document.getElementById('sections-container');
  if (present) {
    statusElement.textContent = 'Boom Calendar is present on this page.';
    statusElement.classList.remove('has-text-danger');
    statusElement.classList.add('has-text-success');
    iconElement.textContent = '✅';
    // Show section list when calendar is present
    if (sectionsContainer) {
      sectionsContainer.style.display = 'block';
    }
  } else {
    statusElement.textContent = 'Boom Calendar is not present on this page.';
    statusElement.classList.remove('has-text-success');
    statusElement.classList.add('has-text-danger');
    iconElement.textContent = '❌';
    // Hide sections list when calendar is not present
    if (sectionsContainer) {
      sectionsContainer.style.display = 'none';
    }
  }
}

/**
 * Query the active tab and send a message to the content script.
 * Updates the UI based on the response.
 */
function updateStatus() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) {
      setStatus(false);
      return;
    }
    const tabId = tabs[0].id;
    // Send a message to the content script in the current tab
    chrome.tabs.sendMessage(tabId, { type: 'checkCalendar' }, (response) => {
      if (chrome.runtime.lastError) {
        // Could not communicate with the tab (e.g. no content script on this page)
        setStatus(false);
        return;
      }
      if (response && typeof response.present === 'boolean') {
        setStatus(response.present);
      } else {
        setStatus(false);
      }
    });
  });
}

// When the popup loads, immediately check the calendar status
document.addEventListener('DOMContentLoaded', () => {
  updateStatus();
  // Attach click handlers for navigation after DOM is ready
  const localizeBtn = document.getElementById('section-localize');
  if (localizeBtn) {
    localizeBtn.addEventListener('click', showLocalize);
  }
  const backHomeBtn = document.getElementById('back-home');
  if (backHomeBtn) {
    backHomeBtn.addEventListener('click', showHome);
  }
});

/**
 * Display the home view (status and sections panel) and hide any
 * subsection views (e.g. localize).
 */
function showHome() {
  const homeContainer = document.getElementById('home-container');
  const localizeContainer = document.getElementById('localize-container');
  if (homeContainer) homeContainer.style.display = 'block';
  if (localizeContainer) localizeContainer.style.display = 'none';
}

/**
 * Display the Localize settings view. Fetches the current Autotranslation
 * setting from the page via the content script and updates the UI.
 */
function showLocalize() {
  const homeContainer = document.getElementById('home-container');
  const localizeContainer = document.getElementById('localize-container');
  if (homeContainer) homeContainer.style.display = 'none';
  if (localizeContainer) localizeContainer.style.display = 'block';
  // Query the active tab and request the Autotranslation setting
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) {
      updateAutotranslation(true);
      return;
    }
    const tabId = tabs[0].id;
    chrome.tabs.sendMessage(tabId, { type: 'getLocalizeSettings' }, (response) => {
      if (chrome.runtime.lastError) {
        // Use default value when there is an error communicating
        updateAutotranslation(true);
        return;
      }
      if (response && typeof response.autotranslation === 'boolean') {
        updateAutotranslation(response.autotranslation);
      } else {
        updateAutotranslation(true);
      }
    });
  });
}

/**
 * Update the Autotranslation UI elements based on its on/off state.
 * @param {boolean} on Whether Autotranslation is turned on.
 */
function updateAutotranslation(on) {
  const stateElement = document.getElementById('autotranslation-state');
  const boxElement = document.getElementById('autotranslation-box');
  if (!stateElement || !boxElement) return;
  if (on) {
    stateElement.textContent = 'On';
    stateElement.classList.remove('is-danger');
    stateElement.classList.add('is-success');
    // Apply a light success background to the box
    boxElement.classList.remove('has-background-danger-light');
    boxElement.classList.add('has-background-success-light');
  } else {
    stateElement.textContent = 'Off';
    stateElement.classList.remove('is-success');
    stateElement.classList.add('is-danger');
    boxElement.classList.remove('has-background-success-light');
    boxElement.classList.add('has-background-danger-light');
  }
}