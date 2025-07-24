console.log("Productivity Tracker: Content script loaded on page.");

window.addEventListener("message", (event) => {
    if (event.source !== window || !event.data || event.data.type !== "WEB_PAGE_LOGIN") {
        return;
    }

    console.log("Content script received login message from web page:", event.data.payload);
    chrome.runtime.sendMessage({
        type: "USER_LOGIN",
        payload: event.data.payload
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Content script error sending message to background:", chrome.runtime.lastError.message);
            window.postMessage({ type: "EXTENSION_LOGIN_RESPONSE", success: false, error: chrome.runtime.lastError.message }, "*");
        } else {
            console.log("Content script: Background script responded:", response);
            window.postMessage({ type: "EXTENSION_LOGIN_RESPONSE", ...response }, "*");
        }
    });
});