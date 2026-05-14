'use strict';

class Scroller {
  constructor(canvas, options) {
    this.renderer = new LedRenderer(canvas);
    this.text = options.text;
    this.color = options.color;
    this.fontSize = options.fontSize;
    this.speed = options.speed;
    this.blink = options.blink || false;
    this.dir = options.dir || 'rtl'; // 'rtl': 우→좌, 'ltr': 좌→우

    this.offsetX = 0;
    this.bitmap = null;
    this.rafId = null;
    this._blinkOn = true;
    this._blinkLastToggle = 0;
    // speed 1 → 1000ms, speed 10 → 100ms
    this._blinkInterval = 1100 - (options.blinkSpeed || 5) * 100;
  }

  start() {
    this.renderer.resize();
    this.bitmap = this.renderer.buildTextBitmap(this.text, this.fontSize);
    this.offsetX = 0;
    this._blinkLastToggle = performance.now();
    this._loop();
  }

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  _loop() {
    if (this.dir === 'rtl') {
      this.offsetX += this.speed;
      if (this.offsetX > this.bitmap.width) {
        this.offsetX = -this.renderer.w;
      }
    } else {
      this.offsetX -= this.speed;
      if (this.offsetX < -this.renderer.w) {
        this.offsetX = this.bitmap.width;
      }
    }

    if (this.blink) {
      const now = performance.now();
      if (now - this._blinkLastToggle >= this._blinkInterval) {
        this._blinkOn = !this._blinkOn;
        this._blinkLastToggle = now;
      }
    }

    if (!this.blink || this._blinkOn) {
      this.renderer.draw(this.bitmap.pixels, this.bitmap.width, this.offsetX, this.color);
    } else {
      this.renderer.clear();
    }

    this.rafId = requestAnimationFrame(() => this._loop());
  }
}
