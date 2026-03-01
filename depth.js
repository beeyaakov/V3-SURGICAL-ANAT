export const DepthManager = {
  depth: 0, max: 60, target: 0,

  init() { window.DepthManager = this; },

  set(v) {
    this.target = Math.max(0, Math.min(this.max, v));
  },

  get() { return this.depth; },

  update(dt) {
    // Smooth depth interpolation
    this.depth += (this.target - this.depth) * Math.min(dt * 8, 1);
    // Natural recovery toward surface
    this.target = Math.max(0, this.target - dt * 0.5);
  }
};
