function getFaviconUrl(tab) {
  if (tab?.favIconUrl) {
    return tab.favIconUrl;
  }

  try {
    const parsed = new URL(tab?.url || '');
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
    }
  } catch (error) {
    // ignore invalid URLs
  }

  return null;
}

function injectContentScript(tabId) {
  if (!tabId) return;

  chrome.scripting.executeScript({
    target: { tabId },
    files: ["content.js"]
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("[SessionWatch] Script injection failed:", chrome.runtime.lastError.message);
    } else {
      console.log("[SessionWatch] Injected content script into tab", tabId);
    }
  });
}

function injectIntoAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.id && tab.url && tab.url.startsWith("http")) {
        injectContentScript(tab.id);
      }
    });
  });
}

function sendAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    console.log("[SessionWatch] Found " + tabs.length + " tabs");
    const tabList = tabs.map(tab => ({
      id: tab.id,
      title: tab.title,
      url: tab.url,
      active: tab.active,
      favIconUrl: getFaviconUrl(tab)
    }));

    sendData({
      type: "ALL_TABS",
      tabs: tabList,
      timestamp: new Date().toISOString()
    });
  });
}

injectIntoAllTabs();
sendAllTabs();
setInterval(sendAllTabs, 2000);

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  let tab = await chrome.tabs.get(activeInfo.tabId);
  console.log("[SessionWatch] Tab switched to: " + tab.title);

  sendData({
    type: "TAB_SWITCH",
    url: tab.url,
    title: tab.title,
    favIconUrl: getFaviconUrl(tab),
    timestamp: new Date().toISOString()
  });

  sendAllTabs();
  injectContentScript(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    console.log("[SessionWatch] Tab updated: " + tab.title);
    sendData({
      type: "URL_CHANGE",
      url: tab.url,
      title: tab.title,
      favIconUrl: getFaviconUrl(tab),
      timestamp: new Date().toISOString()
    });
    sendAllTabs();
    injectContentScript(tabId);
  }
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (!message || !message.type) return;

  console.log("[SessionWatch] Received message:", message, sender);

  const data = {
    ...message,
    url: message.url || sender?.tab?.url || '',
    title: message.title || sender?.tab?.title || '',
    favIconUrl: message.favIconUrl || (sender?.tab ? getFaviconUrl(sender.tab) : null),
    timestamp: new Date().toISOString()
  };

  sendData(data);
});

function sendData(data) {
  fetch("http://localhost:5180/api/event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(() => console.log("[SessionWatch] Data sent successfully"))
  .catch(err => console.error("[SessionWatch] Error:", err.message));
}