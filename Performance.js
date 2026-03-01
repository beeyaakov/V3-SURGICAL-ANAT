export const Performance = {
  fps: 0, last: 0, count: 0,
  budgetMs: 16.67,
  frameStart: 0,

  init() { window.Performance = this; },

  mark() { this.frameStart = performance.now(); },

  drawHUD() {
    this.count++;
    const now = performance.now();
    if (now - this.last > 1000) {
      this.fps = this.count;
      this.count = 0;
      this.last = now;
    }

    const d = window.DepthManager?.get() ?? 0;
    const dmax = window.DepthManager?.max ?? 60;
    const bleed = window.Tissue?.bleed ?? 0;
    const elast = window.Tissue?.elasticity ?? 0;
    const tension = window.Tissue?.tension ?? 0;
    const tool = window.Tools?.active?.name ?? "—";
    const particles = window.Tissue?.particles?.length ?? 0;
    const incisions = window.Tissue?.incisions?.length ?? 0;
    const layerIdx = Math.min(6, Math.floor(d / (60 / 7)));
    const layerNames = ["Epidermis","Dermis","Subcutaneous","Deep Fascia","Muscle","Periosteum","Bone Cortex"];

    const hud = document.getElementById("hud");
    if (!hud) return;

    const fpsColor = this.fps >= 55 ? "#60ff90" : this.fps >= 30 ? "#ffcc00" : "#ff4444";
    const bleedColor = bleed < 0.3 ? "#80ff90" : bleed < 0.7 ? "#ffcc44" : "#ff3030";
    const depthPct = (d / dmax * 100).toFixed(0);

    hud.innerHTML = `
      <div class="hud-row" style="color:${fpsColor}">▸ FPS: ${this.fps}</div>
      <div class="hud-row">⊞ LAYER: <span style="color:#a8d8ff">${layerNames[layerIdx]}</span></div>
      <div class="hud-row">⬇ DEPTH: ${d.toFixed(1)} / ${dmax} mm
        <div class="bar-wrap"><div class="bar-fill" style="width:${depthPct}%;background:${depthBarColor(d, dmax)}"></div></div>
      </div>
      <div class="hud-row" style="color:${bleedColor}">⬤ BLEED: ${(bleed * 100).toFixed(0)}%
        <div class="bar-wrap"><div class="bar-fill" style="width:${(bleed*100).toFixed(0)}%;background:${bleedColor}"></div></div>
      </div>
      <div class="hud-row">⚡ TENSION: ${(tension * 100).toFixed(0)}%</div>
      <div class="hud-row">◈ ELASTICITY: ${(elast * 100).toFixed(0)}%</div>
      <div class="hud-sep"></div>
      <div class="hud-row">✦ TOOL: <span style="color:#ffd47a">${tool}</span></div>
      <div class="hud-row">◐ PARTICLES: ${particles}</div>
      <div class="hud-row">⊘ INCISIONS: ${incisions}</div>
    `;
  }
};

function depthBarColor(d, max) {
  const t = d / max;
  const r = Math.floor(40 + 200 * t);
  const g = Math.floor(180 - 140 * t);
  const b = Math.floor(220 - 180 * t);
  return `rgb(${r},${g},${b})`;
}
