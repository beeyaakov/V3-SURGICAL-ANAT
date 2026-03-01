export const Registry = {
  layers: [], tools: [], plugins: [],

  init() { window.Registry = this; },

  registerLayer(l) { this.layers.push(l); },
  registerTool(t)  { this.tools.push(t); },
  registerPlugin(p){ this.plugins.push(p); },

  update(dt) {
    for (const l of this.layers) { try { l.update?.(dt); } catch(e) { console.error("[Registry layer]", e); } }
    for (const t of this.tools)  { try { t.update?.(dt); } catch(e) { console.error("[Registry tool]", e); } }
    for (const p of this.plugins){ try { p.update?.(dt); } catch(e) { console.error("[Registry plugin]", e); } }
  }
};
