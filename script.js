(function () {
  'use strict';
  var root = document.documentElement;
  var cover = document.getElementById('cover');
  var audio = document.getElementById('bg-music');
  var player = document.getElementById('player');
  var label = document.getElementById('playLabel');
  var hand = ' <span aria-hidden="true">\uD83D\uDC46</span>';

  root.classList.add('locked');

  /* ---------- Calendar (January 2027: 1 Jan is a Friday) ---------- */
  var HEART = '<svg viewBox="0 0 40 36" aria-hidden="true"><use href="#heart"/></svg>';
  document.querySelectorAll('[data-cal]').forEach(function (grid) {
    var hit = parseInt(grid.closest('.cal').getAttribute('data-day'), 10);
    var html = '';
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(function (d) { html += '<span class="dow">' + d + '</span>'; });
    var startCol = new Date(2027, 0, 1).getDay();           // 5 = Friday
    for (var i = 0; i < startCol; i++) html += '<span></span>';
    for (var day = 1; day <= 31; day++) {
      html += day === hit
        ? '<span class="hit">' + HEART + '<b>' + day + '</b></span>'
        : '<span>' + day + '</span>';
    }
    grid.innerHTML = html;
  });

  /* ---------- Music ---------- */
  function setPlaying(on) {
    player.classList.toggle('playing', on);
    label.innerHTML = (on ? 'CLICK TO PAUSE' : 'CLICK TO PLAY') + hand;
  }
  function play() {
    audio.volume = 0.45;
    var p = audio.play();
    if (p && p.then) p.then(function () { setPlaying(true); }).catch(function () { setPlaying(false); });
    else setPlaying(true);
  }
  player.addEventListener('click', function () {
    if (audio.paused) play(); else { audio.pause(); setPlaying(false); }
  });
  audio.addEventListener('pause', function () { setPlaying(false); });
  audio.addEventListener('play', function () { setPlaying(true); });
  setPlaying(false);

  /* ---------- Opening: ribbon video plays, then the cover opens to reveal the page ---------- */
  var video = document.getElementById('coverVideo');
  var hint = document.getElementById('coverHint');
  var VW = 672, VH = 1196;                          // video size

  function layout() {
    var vw = window.innerWidth, vh = window.innerHeight;
    var narrow = vw / vh <= 0.7;
    var s = narrow ? Math.max(vw / VW, vh / VH) : vh / VH;
    video.style.width = VW * s + 'px'; video.style.height = VH * s + 'px';
    video.style.left = (vw - VW * s) / 2 + 'px'; video.style.top = (vh - VH * s) / 2 + 'px';
  }
  layout();
  window.addEventListener('resize', layout);

  var opened = false, finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    root.classList.remove('locked');
    window.scrollTo(0, 0);
    cover.classList.add('fade');              // video zooms in slightly and fades out
    setTimeout(function () { cover.classList.add('gone'); }, 1100);
  }
  function openInvite() {
    if (opened) return;
    opened = true;
    play();                                   // the tap is a user gesture, so audio is allowed
    hint.classList.add('hide');
    var p = video.play();
    if (p && p.catch) p.catch(finish);
    // speed up the last part (flap opening / card reveal)
    var fast = false;
    var watch = setInterval(function () {
      if (!fast && video.currentTime >= 1.8) { fast = true; video.playbackRate = 2; }
      if (video.currentTime >= 4.5 || finished) { clearInterval(watch); finish(); }
    }, 40);
    video.addEventListener('ended', finish);
    video.addEventListener('error', finish);
    setTimeout(finish, 7000);                 // safety net
  }
  cover.addEventListener('click', openInvite);
  cover.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openInvite(); }
  });

  /* ---------- Countdown: 11 Jan 2027, 10:30 AM IST ---------- */
  var target = new Date('2027-01-11T10:30:00+05:30').getTime();
  var boxes = Array.prototype.map.call(document.querySelectorAll('[data-countdown]'), function (el) {
    return { d: el.querySelector('[data-d]'), h: el.querySelector('[data-h]'), m: el.querySelector('[data-m]'), s: el.querySelector('[data-s]') };
  });
  function pad(n) { return String(n).padStart(2, '0'); }
  function tick() {
    var diff = Math.max(0, target - Date.now());
    var v = {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000)
    };
    boxes.forEach(function (b) {
      b.d.textContent = pad(v.d); b.h.textContent = pad(v.h);
      b.m.textContent = pad(v.m); b.s.textContent = pad(v.s);
    });
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Scroll reveal ---------- */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }
})();
