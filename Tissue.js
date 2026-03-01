export const Tissue = {
  elasticity: 0.3,
  bleed: 0,
  tension: 0,
  particles: [],
  incisions: [],

  init() {
    window.Tissue = this;
    this.particles = [];
    this.incisions = [];
  },

  update(dt) {
    // Bleed decay
    if (this.bleed > 0) this.bleed = Math.max(0, this.bleed - dt * 0.08);
    // Tension decay
    if (this.tension > 0) this.tension = Math.max(0, this.tension - dt * 0.3);

    // Update blood particles
    this.particles = this.particles.filter(p => p.life > 0);
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 60 * dt; // gravity
      p.life -= dt;
      p.r = Math.max(0, p.r - dt * 0.5);
    }

    // Incision age
    for (const inc of this.incisions) {
      inc.age += dt;
      inc.gape = Math.max(0, inc.gape - dt * this.elasticity * 0.5);
    }
    // Clean old incisions
    this.incisions = this.incisions.filter(i => i.age < 12);
  },

  cut(x, y, force) {
    const depth = window.DepthManager;
    depth.set(depth.get() + force);
    this.bleed = Math.min(1, this.bleed + force * 0.05);
    this.tension += force * 0.2;

    // Add incision
    this.incisions.push({
      x, y,
      len: 20 + force * 8,
      angle: -Math.PI / 2 + (Math.random() - 0.5) * 0.3,
      gape: force * 1.5,
      age: 0,
      layer: Math.floor(depth.get() / 10)
    });

    // Spawn blood droplets
    const count = Math.floor(force * 3);
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 40,
        vy: -Math.random() * 30,
        r: 2 + Math.random() * 3,
        life: 1.5 + Math.random()
      });
    }
  },

  inject(x, y) {
    this.elasticity = Math.min(0.95, this.elasticity + 0.05);
    this.tension = Math.max(0, this.tension - 0.3);
    // Healing particles
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 20,
        vy: -Math.random() * 20 - 5,
        r: 1.5 + Math.random() * 2,
        life: 1.2,
        type: "heal"
      });
    }
  }
};
