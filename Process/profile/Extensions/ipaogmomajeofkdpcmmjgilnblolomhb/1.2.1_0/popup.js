document.addEventListener('DOMContentLoaded', function () {
    const htmlInput = document.getElementById('htmlInput');
    const htmlPreview = document.querySelector('.preview-content');
    const injectButton = document.getElementById('injectButton');

    // Update preview on input change
    htmlInput.addEventListener('input', function () {
        htmlPreview.innerHTML = htmlInput.value;
    });

    injectButton.addEventListener('click', function () {
        const htmlContent = htmlInput.value;
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.scripting.executeScript({
                target: {tabId: tabs[0].id},
                function: injectHTML,
                args: [htmlContent]
            });
        });
    });
});

function injectHTML(htmlContent) {
    // Use a more robust selector targeting multiline editable textboxes
    const selectors = [
        '[role="textbox"][contenteditable="true"][aria-multiline="true"]', 
    ];

    let composeArea = null;

    for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        console.log(`Checking selector: ${selector}, found ${elements.length} elements`);
        
        // We assume the first element found with this more specific selector is the correct one.
        // If multiple elements match, we might need more complex logic, but this is a good starting point.
        if (elements.length > 0) {
             // Check if the element is visible and not inside a known non-compose area if necessary
             // For now, let's assume the first match is correct. Refine if needed.
            composeArea = elements[0]; 
            console.log('Compose area found with selector:', selector);
            break; 
        }
    }

    if (composeArea) {
        // Inject the HTML content if the compose area is found
        console.log('Injecting HTML content');
        composeArea.innerHTML = htmlContent;
    } else {
        // Handle cases where the compose area is not found
        console.error("Could not find the compose message area. The selector might need further refinement.");
    }
}