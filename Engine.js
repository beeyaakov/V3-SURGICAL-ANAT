export const Engine = {
  canvas: null, ctx: null, w: 0, h: 0, last: 0,
  mouse: { x: 0, y: 0, down: false },

  init(id) {
    this.canvas = document.getElementById(id);
    this.ctx = this.canvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());

    this.canvas.addEventListener("mousemove", e => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    this.canvas.addEventListener("mousedown", e => {
      this.mouse.down = true;
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    this.canvas.addEventListener("mouseup", () => { this.mouse.down = false; });
    // Touch support
    this.canvas.addEventListener("touchstart", e => {
      e.preventDefault();
      this.mouse.down = true;
      this.mouse.x = e.touches[0].clientX;
      this.mouse.y = e.touches[0].clientY;
    }, { passive: false });
    this.canvas.addEventListener("touchmove", e => {
      e.preventDefault();
      this.mouse.x = e.touches[0].clientX;
      this.mouse.y = e.touches[0].clientY;
    }, { passive: false });
    this.canvas.addEventListener("touchend", () => { this.mouse.down = false; });
  },

  resize() {
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = this.w;
    this.canvas.height = this.h;
  },

  loop(t) {
    const dt = Math.min((t - this.last) / 1000, 0.05);
    this.last = t;
    try { this.update(dt); } catch(e) { console.error("[Engine.update]", e); }
    try { this.render(); } catch(e) { console.error("[Engine.render]", e); }
    requestAnimationFrame(ts => this.loop(ts));
  },

  update(dt) {
    window.Registry?.update(dt);
    window.Tissue?.update(dt);
    window.Tools?.update(dt);
    window.Plugins?.update(dt);
  },

  render() {
    this.ctx.clearRect(0, 0, this.w, this.h);
    window.Layers?.draw(this.ctx);
    window.Masking?.apply(this.ctx);
    window.Performance?.drawHUD();
  },

  start() {
    requestAnimationFrame(ts => { this.last = ts; this.loop(ts); });
  }
};
