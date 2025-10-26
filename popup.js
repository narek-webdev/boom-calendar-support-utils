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
});