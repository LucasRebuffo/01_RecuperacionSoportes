chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const composeAreas = document.querySelectorAll('[contenteditable="true"]');
  if (composeAreas.length > 0) {
      composeAreas[0].innerHTML = request.htmlContent; // You might need to adjust this to target the correct compose area.
  }
});
