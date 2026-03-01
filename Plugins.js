export const Plugins = {
  stack: [],

  init() {
    window.Plugins = this;

    // Built-in plugin: hemorrhage alarm
    const hemorrhageMonitor = {
      name: "HemorrhageMonitor",
      threshold: 0.75,
      alertActive: false,
      alertTimer: 0,
      update(dt) {
        const bleed = window.Tissue?.bleed ?? 0;
        if (bleed >= this.threshold) {
          this.alertActive = true;
          this.alertTimer += dt;
        } else {
          this.alertActive = false;
          this.alertTimer = 0;
        }
        const el = document.getElementById("alert-banner");
        if (!el) return;
        if (this.alertActive) {
          el.style.display = "block";
          el.style.opacity = 0.5 + 0.5 * Math.sin(this.alertTimer * 6);
        } else {
          el.style.display = "none";
        }
      }
    };

    // Built-in plugin: depth warning
    const depthGuard = {
      name: "DepthGuard",
      update() {
        const depth = window.DepthManager?.get() ?? 0;
        const el = document.getElementById("depth-warning");
        if (!el) return;
        if (depth > 45) {
          el.style.display = "block";
          el.textContent = depth > 55 ? "⚠ BONE CONTACT" : "⚠ CRITICAL DEPTH";
          el.style.color = depth > 55 ? "#ff8844" : "#ffcc44";
        } else {
          el.style.display = "none";
        }
      }
    };

    this.register(hemorrhageMonitor);
    this.register(depthGuard);
  },

  register(p) {
    this.stack.push(p);
    window.Registry?.registerPlugin(p);
  },

  update(dt) {
    for (const p of this.stack) {
      try { p.update?.(dt); } catch(e) { console.error(`[Plugin:${p.name}]`, e); }
    }
  }
};
