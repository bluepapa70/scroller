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
  const blinkToggle = document.getElementById('blink-toggle');
  const blinkSpeedSection = document.getElementById('blink-speed-section');
  const blinkSpeedRange = document.getElementById('blink-speed-range');
  const blinkSpeedVal = document.getElementById('blink-speed-val');
  const dirBtns = document.querySelectorAll('.dir-btn');
  const startBtn = document.getElementById('start-btn');

  let selectedColor = '#00ff41';
  let selectedDir = 'ltr';
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

  // 방향 선택
  dirBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dirBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedDir = btn.dataset.dir;
    });
  });

  // 깜빡임 토글 → 속도 슬라이더 표시/숨김
  blinkToggle.addEventListener('change', () => {
    blinkSpeedSection.hidden = !blinkToggle.checked;
  });

  blinkSpeedRange.addEventListener('input', () => {
    blinkSpeedVal.textContent = blinkSpeedRange.value;
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
      blink: blinkToggle.checked,
      blinkSpeed: parseInt(blinkSpeedRange.value, 10),
      dir: selectedDir,
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

  // canvas 재조정 (전광판 표시 중 크기 변경 시)
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
        blink: blinkToggle.checked,
        blinkSpeed: parseInt(blinkSpeedRange.value, 10),
        dir: selectedDir,
      });
      scroller.start();
    }
  });

  // 가로 모드 전환 시 자동 전체화면, 세로 모드 복귀 시 설정 화면으로
  const landscapeQuery = window.matchMedia('(orientation: landscape)');
  landscapeQuery.addEventListener('change', e => {
    if (e.matches && ledScreen.hidden) {
      showLed();
    } else if (!e.matches && !ledScreen.hidden) {
      hideLed();
    }
  });

  // 서비스워커 등록
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});
