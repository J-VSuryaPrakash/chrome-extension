// content.js
console.log("Productivity Tracker: Content script loaded on page.");

// Listen for messages from the web page (your React app's Login.jsx)

window.addEventListener("message", (event) => {
    // We only accept messages from ourselves to prevent malicious attacks
    if (event.source !== window || !event.data || event.data.type !== "WEB_PAGE_LOGIN") {
        return; // Ignore messages not from this window or not of the expected type
    }

    console.log("Content script received login message from web page:", event.data.payload);

    // Now, forward this message to the extension's background script
    chrome.runtime.sendMessage({
        type: "USER_LOGIN",
        payload: event.data.payload // Include any login data if you want to pass it
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Content script error sending message to background:", chrome.runtime.lastError.message);
            // Optionally, send an error response back to the web page
            window.postMessage({ type: "EXTENSION_LOGIN_RESPONSE", success: false, error: chrome.runtime.lastError.message }, "*");
        } else {
            console.log("Content script: Background script responded:", response);
            // Send the background script's response back to the web page
            window.postMessage({ type: "EXTENSION_LOGIN_RESPONSE", ...response }, "*");
        }
    });
});