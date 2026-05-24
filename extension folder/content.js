if (window.__sessionTrackerInjected) {
    console.log("[SessionWatch] Content script already injected for this tab.");
} else {
    window.__sessionTrackerInjected = true;

    const isDashboardPage = window.location.hostname === 'localhost' && window.location.port === '5180';
    if (isDashboardPage) {
        console.log("[SessionWatch] Skipping content script click injection on dashboard page.");
        return;
    }

    let clickCount = 0;

    document.addEventListener("click", (e) => {
        clickCount++;

        const data = {
            type: "CLICK",
            tag: e.target.tagName,
            id: e.target.id,
            className: e.target.className,
            text: e.target.innerText?.slice(0, 50),
            time: new Date().toLocaleTimeString(),
            url: window.location.href,
            totalClicks: clickCount
        };

        console.log("[SessionWatch] Click Event:", data);
        chrome.runtime.sendMessage(data, (response) => {
            if (chrome.runtime.lastError) {
                console.warn("[SessionWatch] Runtime message failed, fallback to direct event post:", chrome.runtime.lastError.message);
                sendEventToServer(data);
            } else {
                console.log("[SessionWatch] Click event sent to background");
            }
        });
    });

let inactivityTimer;

function sendEventToServer(eventData) {
    fetch("http://localhost:5180/api/event", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(eventData)
    })
    .then(response => response.json())
    .then(() => console.log("[SessionWatch] Event sent to server:", eventData.type))
    .catch(error => console.error("[SessionWatch] Failed to send event:", error));
}

function resetInactivity() {

    clearTimeout(inactivityTimer);

    inactivityTimer = setTimeout(() => {

        console.log("User Inactive");

        const inactiveEvent = { type: "INACTIVE" };
        chrome.runtime.sendMessage(inactiveEvent, (response) => {
            if (chrome.runtime.lastError) {
                console.warn("[SessionWatch] Runtime message failed, fallback inactive event:", chrome.runtime.lastError.message);
                sendEventToServer(inactiveEvent);
            } else {
                console.log("[SessionWatch] Inactive event sent to background");
            }
        });

    }, 60000);

}

document.addEventListener("mousemove", resetInactivity);
document.addEventListener("mousedown", resetInactivity);
document.addEventListener("keydown", resetInactivity);
document.addEventListener("touchstart", resetInactivity);
document.addEventListener("click", resetInactivity);

resetInactivity();
}
