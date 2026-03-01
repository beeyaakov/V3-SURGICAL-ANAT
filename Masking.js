export const Tools = {
  active: null,
  list: [],
  cursor: { x: 0, y: 0 },

  init() {
    window.Tools = this;

    const scalpel = {
      name: "Scalpel",
      icon: "✦",
      color: "#e8c87a",
      dragging: false,
      lastX: 0, lastY: 0,
      update() {
        const m = window.Engine.mouse;
        if (m.down && !this.dragging) {
          this.dragging = true;
          this.lastX = m.x; this.lastY = m.y;
        }
        if (!m.down) this.dragging = false;
        if (this.dragging) {
          const dx = m.x - this.lastX;
          const dy = m.y - this.lastY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 2) {
            const force = Math.min(dist / 20, 3);
            window.Tissue.cut(m.x, m.y, force);
            this.lastX = m.x; this.lastY = m.y;
          }
        }
      },
      use(x, y) { window.Tissue.cut(x, y, 2); }
    };

    const injector = {
      name: "Injector",
      icon: "⊕",
      color: "#78d8a0",
      cooldown: 0,
      update() {
        const m = window.Engine.mouse;
        if (this.cooldown > 0) { this.cooldown -= 1 / 60; return; }
        if (m.down) {
          window.Tissue.inject(m.x, m.y);
          this.cooldown = 0.18;
        }
      },
      use(x, y) { window.Tissue.inject(x, y); }
    };

    const cauterizer = {
      name: "Cauterizer",
      icon: "⚡",
      color: "#ff9050",
      update() {
        const m = window.Engine.mouse;
        if (m.down) {
          window.Tissue.bleed = Math.max(0, window.Tissue.bleed - 0.015);
          window.DepthManager.set(window.DepthManager.get() - 0.3);
          // Emit cauterize sparks (reuse particle system)
          if (Math.random() < 0.4) {
            window.Tissue.particles.push({
              x: m.x, y: m.y,
              vx: (Math.random() - 0.5) * 60,
              vy: -Math.random() * 50 - 10,
              r: 1 + Math.random() * 2,
              life: 0.4,
              type: "spark"
            });
          }
        }
      },
      use() {}
    };

    this.list = [scalpel, injector, cauterizer];
    for (const t of this.list) window.Registry.registerTool(t);
    this.active = scalpel;

    // Tool switch via keyboard 1/2/3
    window.addEventListener("keydown", e => {
      if (e.key === "1") this.setActive(0);
      if (e.key === "2") this.setActive(1);
      if (e.key === "3") this.setActive(2);
    });
  },

  setActive(i) {
    if (this.list[i]) {
      this.active = this.list[i];
      this.syncHUD();
    }
  },

  syncHUD() {
    const el = document.getElementById("tool-selector");
    if (!el) return;
    el.querySelectorAll(".tool-btn").forEach((btn, i) => {
      btn.classList.toggle("active", this.list[i] === this.active);
    });
  },

  update(dt) {
    try { this.active?.update(dt); } catch(e) { console.error("[Tools.update]", e); }
  }
};
