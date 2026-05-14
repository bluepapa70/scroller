'use strict';

class Scroller {
  constructor(canvas, options) {
    this.renderer = new LedRenderer(canvas);
    this.text = options.text;
    this.color = options.color;
    this.fontSize = options.fontSize;
    this.speed = options.speed;

    this.offsetX = 0;
    this.bitmap = null;
    this.rafId = null;
  }

  start() {
    this.renderer.resize();
    this.bitmap = this.renderer.buildTextBitmap(this.text, this.fontSize);
    // 텍스트가 오른쪽 끝에서 시작
    this.offsetX = -this.renderer.w;
    this._loop();
  }

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  _loop() {
    this.offsetX += this.speed;
    // 텍스트 전체가 왼쪽으로 사라지면 오른쪽 끝으로 리셋
    if (this.offsetX > this.bitmap.width) {
      this.offsetX = -this.renderer.w;
    }

    this.renderer.draw(this.bitmap.pixels, this.bitmap.width, this.offsetX, this.color);
    this.rafId = requestAnimationFrame(() => this._loop());
  }
}
