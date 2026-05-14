'use strict';

const DOT_SIZE = 5;
const GAP = 3;
const PITCH = DOT_SIZE + GAP;
const DOT_RADIUS = DOT_SIZE / 2;
const DIM_COLOR = '#1c1c1c';

class LedRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.offscreen = document.createElement('canvas');
    this.offCtx = this.offscreen.getContext('2d');
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.scale(dpr, dpr);
    this.w = w;
    this.h = h;
  }

  // 텍스트를 오프스크린에 렌더링하고 픽셀 데이터를 반환
  buildTextBitmap(text, fontSize) {
    const os = this.offscreen;
    const octx = this.offCtx;

    os.height = this.h;
    octx.font = `bold ${fontSize}px sans-serif`;
    const metrics = octx.measureText(text);
    const textW = Math.ceil(metrics.width) + PITCH * 2;
    os.width = textW;

    octx.clearRect(0, 0, textW, this.h);
    octx.fillStyle = '#ffffff';
    octx.font = `bold ${fontSize}px sans-serif`;
    octx.textBaseline = 'middle';
    octx.fillText(text, PITCH, this.h / 2);

    return { pixels: octx.getImageData(0, 0, textW, this.h), width: textW };
  }

  // 매 프레임 호출: offsetX 위치에서 텍스트 비트맵을 LED 격자로 그린다
  draw(pixels, textW, offsetX, color) {
    const ctx = this.ctx;
    const w = this.w;
    const h = this.h;
    const data = pixels.data;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    const cols = Math.ceil(w / PITCH) + 1;
    const rows = Math.ceil(h / PITCH);

    ctx.shadowBlur = 8;

    for (let row = 0; row < rows; row++) {
      const cy = row * PITCH + DOT_RADIUS;

      for (let col = 0; col < cols; col++) {
        const cx = col * PITCH + DOT_RADIUS;

        // 이 화면 도트에 해당하는 오프스크린 픽셀 좌표
        const srcX = Math.round(cx - offsetX);
        const srcY = Math.round(cy);
        let lit = false;

        if (srcX >= 0 && srcX < textW && srcY >= 0 && srcY < h) {
          const idx = (srcY * textW + srcX) * 4;
          lit = data[idx + 3] > 64; // alpha 임계값
        }

        if (lit) {
          ctx.shadowColor = color;
          ctx.fillStyle = color;
        } else {
          ctx.shadowColor = 'transparent';
          ctx.fillStyle = DIM_COLOR;
        }

        ctx.beginPath();
        ctx.arc(cx, cy, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.shadowBlur = 0;
  }
}
