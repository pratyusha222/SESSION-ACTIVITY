let listeners = [];

export function startTracking(onEvent) {
  listeners.push(onEvent);

  const emit = (type, extra = {}) => {
    const event = {
      type,
      timestamp: new Date().toISOString(),
      ...extra
    };

    listeners.forEach((fn) => fn(event));
  };

  // Tab visibility
  document.addEventListener("visibilitychange", () => {
    emit(document.hidden ? "TAB_HIDDEN" : "TAB_VISIBLE");
  });

  // Window focus
  window.addEventListener("blur", () => emit("WINDOW_BLUR"));
  window.addEventListener("focus", () => emit("WINDOW_FOCUS"));

  // Fullscreen
  document.addEventListener("fullscreenchange", () => {
    emit(
      document.fullscreenElement
        ? "FULLSCREEN_ENTER"
        : "FULLSCREEN_EXIT"
    );
  });

  // Refresh / unload
  window.addEventListener("beforeunload", () => {
    emit("SESSION_END");
  });

  emit("SESSION_START");
} 