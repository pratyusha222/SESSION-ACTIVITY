const express = require("express");
const path = require("path");

const app = express();

// CORS Middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Middleware
app.use(express.json());

// Store tab data and aggregated metrics
let tabsData = [];
let eventsLog = [];
let clickCount = 0;

// API endpoint to receive tab events from extension
app.post("/api/event", (req, res) => {
  const data = req.body;
  
  if (data.type === "ALL_TABS") {
    tabsData = data.tabs;
    console.log(`[${new Date().toLocaleTimeString()}] Updated ${data.tabs.length} tabs`);
    data.tabs.forEach(tab => {
      console.log(`  - ${tab.active ? '✅' : '⬜'} ${tab.title}`);
    });
  } else {
    eventsLog.push(data);
    if (data.type === "CLICK") {
      clickCount += 1;
    }
    console.log(`[${new Date().toLocaleTimeString()}] Event: ${data.type} - ${data.title || data.url || 'unknown'}`);
  }
  
  // Keep only the latest 500 events to avoid memory growth
  if (eventsLog.length > 500) {
    eventsLog = eventsLog.slice(-500);
  }

  res.json({ success: true, received: true });
});

// API endpoint to get current tabs
app.get("/api/tabs", (req, res) => {
  res.json(tabsData);
});

// API endpoint to get events log
app.get("/api/events", (req, res) => {
  res.json(eventsLog.slice(-50)); // Last 50 events
});

// API endpoint to get aggregated dashboard stats
app.get("/api/stats", (req, res) => {
  const pageVisits = eventsLog.filter(e => e.type === "TAB_SWITCH" || e.type === "URL_CHANGE").length;
  const inactiveEvents = eventsLog.filter(e => e.type === "INACTIVE");
  const lastInactiveEvent = inactiveEvents[inactiveEvents.length - 1] || null;

  res.json({
    clickCount,
    pageVisits,
    inactivityCount: inactiveEvents.length,
    lastInactive: lastInactiveEvent,
    eventsCount: eventsLog.length,
    lastEvent: eventsLog[eventsLog.length - 1] || null
  });
});

// Test route to verify server is responsive
app.get("/test-dashboard", (req, res) => {
  res.send("Dashboard server is working!");
});

// FIXED root route - serve dashboard index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// Serve static files from dashboard
app.use(express.static(path.join(__dirname, "..")));

app.listen(5180, () => {
  console.log("Server running on http://localhost:5180");
});