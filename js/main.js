'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const settingsScreen = document.getElementById('settings-screen');
  const ledScreen = document.getElementById('led-screen');
  const canvas = document.getElementById('led-canvas');
  const tapHint = document.getElementById('tap-hint');

  const inputText = document.getElementById('input-text');
  const colorBtns = document.querySelectorAll('.color-btn');
  const sizeRange = document.getElementById('size-range');
  const sizeVal = document.getElementById('size-val');
  const speedRange = document.getElementById('speed-range');
  const speedVal = document.getElementById('speed-val');
  const startBtn = document.getElementById('start-btn');

  let selectedColor = '#ff2d78';
  let scroller = null;
  let hintTimer = null;

  // 색상 선택
  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      colorBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedColor = btn.dataset.color;
    });
  });

  // 슬라이더 레이블 업데이트
  sizeRange.addEventListener('input', () => {
    sizeVal.textContent = `${sizeRange.value}x`;
  });

  speedRange.addEventListener('input', () => {
    speedVal.textContent = speedRange.value;
  });

  // 시작
  startBtn.addEventListener('click', showLed);

  function showLed() {
    const text = inputText.value.trim() || 'Hello!';
    const sizeMultiplier = parseInt(sizeRange.value, 10);
    const speed = parseInt(speedRange.value, 10);

    settingsScreen.hidden = true;
    ledScreen.hidden = false;

    // 전체화면 요청 (모바일 브라우저 지원 시)
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }

    // canvas 크기를 실제 viewport에 맞춤
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';

    // 폰트 크기: 화면 높이의 40%~100%를 1x~5x에 매핑
    const baseH = window.innerHeight;
    const fontSize = Math.round(baseH * (0.35 + (sizeMultiplier - 1) * 0.15));

    if (scroller) {
      scroller.stop();
    }

    scroller = new Scroller(canvas, {
      text,
      color: selectedColor,
      fontSize,
      speed,
    });
    scroller.start();

    // 힌트 표시 후 5초 뒤 숨김
    tapHint.classList.remove('hidden');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => tapHint.classList.add('hidden'), 5000);
  }

  function hideLed() {
    if (scroller) {
      scroller.stop();
      scroller = null;
    }

    clearTimeout(hintTimer);
    ledScreen.hidden = true;
    settingsScreen.hidden = false;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (document.webkitFullscreenElement) {
      document.webkitExitFullscreen();
    }
  }

  // 전광판 화면 탭 → 설정으로 복귀
  ledScreen.addEventListener('click', hideLed);

  // 기기 방향 변경 시 canvas 재조정
  window.addEventListener('resize', () => {
    if (!ledScreen.hidden && scroller) {
      scroller.stop();
      const text = inputText.value.trim() || 'Hello!';
      const sizeMultiplier = parseInt(sizeRange.value, 10);
      const speed = parseInt(speedRange.value, 10);
      const baseH = window.innerHeight;
      const fontSize = Math.round(baseH * (0.35 + (sizeMultiplier - 1) * 0.15));

      scroller = new Scroller(canvas, {
        text,
        color: selectedColor,
        fontSize,
        speed,
      });
      scroller.start();
    }
  });
});
