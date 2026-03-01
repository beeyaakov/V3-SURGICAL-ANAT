export const Layers = {
  zones: [],
  // Anatomy label, base color, highlight color
  DEFS: [
    { name: "Epidermis",      color: "#f2c4a0", shadow: "#c8865a", tex: 0.04 },
    { name: "Dermis",         color: "#e8967a", shadow: "#b85040", tex: 0.08 },
    { name: "Subcutaneous",   color: "#f5d890", shadow: "#d4a030", tex: 0.12 },
    { name: "Deep Fascia",    color: "#d0c8b0", shadow: "#908060", tex: 0.06 },
    { name: "Muscle",         color: "#c03030", shadow: "#7a0000", tex: 0.15 },
    { name: "Periosteum",     color: "#e0dcd0", shadow: "#a09880", tex: 0.05 },
    { name: "Bone Cortex",    color: "#f0ece0", shadow: "#c0b898", tex: 0.03 },
  ],

  init() {
    window.Layers = this;
    this.zones = [];

    this.DEFS.forEach((def, i) => {
      const layer = {
        index: i,
        def,
        _noise: Array.from({ length: 80 }, () => Math.random()),
        update() {},
        draw(ctx) {
          const depth = window.DepthManager.get();
          const threshold = i * (60 / 7);
          if (depth < threshold) return;

          const alpha = Math.min(1, (depth - threshold) / 5);
          const W = window.Engine.w;
          const H = window.Engine.h;
          const cx = W * 0.5;
          const bodyW = Math.min(320, W * 0.38);
          const bodyH = H * 0.78;
          const top = H * 0.11;
          const shrink = i * 6;

          ctx.save();
          ctx.globalAlpha = alpha;

          // Draw layered body cross-section slice
          const x0 = cx - bodyW + shrink;
          const x1 = cx + bodyW - shrink;
          const y0 = top + shrink;
          const y1 = top + bodyH - shrink;

          // Main fill with subtle gradient
          const grad = ctx.createLinearGradient(x0, y0, x1, y1);
          grad.addColorStop(0, def.color);
          grad.addColorStop(0.5, shiftColor(def.color, 15));
          grad.addColorStop(1, def.shadow);
          ctx.fillStyle = grad;

          ctx.beginPath();
          ctx.roundRect(x0, y0, x1 - x0, y1 - y0, [12 - i, 12 - i, 12 - i, 12 - i]);
          ctx.fill();

          // Texture noise lines
          ctx.strokeStyle = def.shadow;
          ctx.lineWidth = 0.4;
          ctx.globalAlpha = alpha * def.tex;
          const n = this._noise;
          for (let j = 0; j < n.length; j++) {
            const ny = y0 + n[j] * (y1 - y0);
            ctx.beginPath();
            ctx.moveTo(x0 + 4, ny);
            ctx.lineTo(x1 - 4, ny + (n[(j + 13) % n.length] - 0.5) * 6);
            ctx.stroke();
          }

          // Layer label
          ctx.globalAlpha = alpha * 0.6;
          ctx.fillStyle = def.shadow;
          ctx.font = `bold ${11 - i * 0.5}px 'Courier New', monospace`;
          ctx.fillText(def.name.toUpperCase(), x0 + 8, y0 + 14 + i * 2);

          // Draw incisions for this layer
          const tissue = window.Tissue;
          if (tissue?.incisions) {
            ctx.globalAlpha = alpha;
            for (const inc of tissue.incisions) {
              if (inc.layer !== i) continue;
              drawIncision(ctx, inc, def);
            }
          }

          ctx.restore();
        }
      };
      this.zones.push(layer);
      window.Registry.registerLayer(layer);
    });
  },

  draw(ctx) {
    // Draw background
    const W = window.Engine.w;
    const H = window.Engine.h;
    const bg = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
    bg.addColorStop(0, "#0d1120");
    bg.addColorStop(1, "#06070d");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Grid overlay
    ctx.strokeStyle = "rgba(80,120,180,0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    for (const z of this.zones) z.draw(ctx);

    // Draw blood particles
    const tissue = window.Tissue;
    if (tissue?.particles) {
      for (const p of tissue.particles) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, p.life) * 0.85;
        ctx.fillStyle = p.type === "heal" ? "#a0ffb0" : "#8b0000";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }
};

function drawIncision(ctx, inc, def) {
  const { x, y, len, angle, gape } = inc;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const hlen = len / 2;

  ctx.save();
  ctx.strokeStyle = "#3a0000";
  ctx.lineWidth = Math.max(0.5, gape);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - cos * hlen, y - sin * hlen);
  ctx.lineTo(x + cos * hlen, y + sin * hlen);
  ctx.stroke();

  // Gape fill
  if (gape > 1) {
    ctx.fillStyle = "#1a0000";
    ctx.beginPath();
    ctx.ellipse(x, y, hlen, gape * 0.5, angle, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function shiftColor(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((n >> 16) & 0xff) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
