function updatePopup() {

    chrome.storage.local.get([

        "tabSwitchCount",
        "clickCount",
        "inactiveTime",
        "lastTabTitle"

    ], (data) => {

        document.getElementById("tabSwitches").innerText =
            data.tabSwitchCount || 0;

        document.getElementById("clickCount").innerText =
            data.clickCount || 0;

        document.getElementById("inactiveTime").innerText =
            (data.inactiveTime || 0) + "m";

        document.getElementById("currentTab").innerText =
            data.lastTabTitle || "No Tab";

    });

}

/* LIVE UPDATE */

setInterval(updatePopup, 1000);

updatePopup();

/* DASHBOARD BUTTON */

document.getElementById("openDashboard")
.addEventListener("click", () => {

    chrome.tabs.create({

        url: "dashboard/index.html"

    });

});

/* RESET BUTTON */

document.getElementById("resetBtn")
.addEventListener("click", () => {

    chrome.storage.local.clear(() => {

        updatePopup();

        document.getElementById("lastActivity").innerText =
            "All data reset.";

    });

});