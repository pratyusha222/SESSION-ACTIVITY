let listeners = [];

export function startTracking(onEvent) {
  listeners.push(onEvent);

  const emit = (type, extra = {}) => {
    const event = {
      type,
      timestamp: new Date().toISOString(),
      ...extra
    };

    listeners.forEach(fn => fn(event));
  };

  // tab switch
  document.addEventListener("visibilitychange", () => {
    emit(document.hidden ? "TAB_HIDDEN" : "TAB_VISIBLE");
  });

  // focus/blur
  window.addEventListener("blur", () => emit("WINDOW_BLUR"));
  window.addEventListener("focus", () => emit("WINDOW_FOCUS"));

  // fullscreen
  document.addEventListener("fullscreenchange", () => {
    emit(document.fullscreenElement ? "FULLSCREEN_ENTER" : "FULLSCREEN_EXIT");
  });

  // refresh/close
  window.addEventListener("beforeunload", () => {
    emit("SESSION_END");
  });

  emit("SESSION_START");
}
app.use(express.json());

app.post("/api/event", (req, res) => {
  console.log("EXTENSION EVENT:", req.body);

  // এখানে তুমি save করতে পারো / dashboard পাঠাতে পারো
  res.sendStatus(200);
});