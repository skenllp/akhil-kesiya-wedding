(function () {
  'use strict';
  var root = document.documentElement;
  var cover = document.getElementById('cover');
  var audio = document.getElementById('bg-music');
  var player = document.getElementById('player');
  var label = document.getElementById('playLabel');
  var hand = ' <span aria-hidden="true">\uD83D\uDC46</span>';

  root.classList.add('locked');

  /* ---------- Calendar (January 2027: 1 Jan is a Friday, so 11 Jan is a Monday) ---------- */
  document.querySelectorAll('[data-cal]').forEach(function (grid) {
    var hit = parseInt(grid.closest('.cal').getAttribute('data-day'), 10);
    var startCol = new Date(2027, 0, 1).getDay();            // 5 = Friday
    var hitCol = (startCol + hit - 1) % 7;                   // 1 = Monday
    var html = '';
    ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].forEach(function (d, i) {
      html += '<span class="dow' + (i === hitCol ? ' mon' : '') + '">' + d + '</span>';
    });
    for (var i = 0; i < startCol; i++) html += '<span aria-hidden="true"></span>';
    for (var day = 1; day <= 31; day++) {
      html += day === hit
        ? '<span class="hit" aria-label="Monday, January 11, 2027 - wedding day">' + day + '</span>'
        : '<span>' + day + '</span>';
    }
    grid.innerHTML = html;
  });

  /* ---------- Music: one audio element, started by the Open tap, never restarted ---------- */
  var ctl = document.getElementById('musicCtl');
  var playBtn = document.getElementById('playBtn');
  audio.volume = 0.4;
  function sync() {
    playBtn.classList.toggle('off', audio.paused);
    playBtn.setAttribute('aria-label', audio.paused ? 'Play music' : 'Pause music');
  }
  function play() {
    if (!audio.paused) return;
    var p = audio.play();
    if (p && p.catch) p.catch(function () { sync(); });
  }
  playBtn.addEventListener('click', function () { if (audio.paused) play(); else audio.pause(); sync(); });
  ['play', 'pause'].forEach(function (ev) { audio.addEventListener(ev, sync); });
  sync();
  play();                                    // attempt autoplay; silently ignored if the browser blocks it

  /* ---------- Opening: ribbon video plays, then the cover opens to reveal the page ---------- */
  var video = document.getElementById('coverVideo');
  var hint = document.getElementById('coverHint');
  var VW = 720, VH = 1280;                          // video size

  function layout() {
    var vw = window.innerWidth, vh = window.innerHeight;
    var narrow = vw / vh <= 0.7;
    var s = narrow ? Math.max(vw / VW, vh / VH) : vh / VH;
    video.style.width = VW * s + 'px'; video.style.height = VH * s + 'px';
    video.style.left = (vw - VW * s) / 2 + 'px'; video.style.top = (vh - VH * s) / 2 + 'px';
    // keep the hint on the blank part of the card, just below the bow, at any screen shape
    hint.style.top = ((vh - VH * s) / 2 + VH * s * 0.765) + 'px';
  }
  layout();
  window.addEventListener('resize', layout);

  var opened = false, finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    try { video.pause(); } catch (e) {}       // freeze on the last frame: no restart or poster flash during the fade
    root.classList.remove('locked');
    ctl.hidden = false;
    window.scrollTo(0, 0);
    cover.classList.add('fade');              // video zooms in slightly and fades out
    setTimeout(function () { cover.classList.add('gone'); }, 1100);
  }
  function openInvite() {
    if (opened) return;
    opened = true;
    video.muted = true;                       // the song plays instead of any clip audio
    try { audio.currentTime = 0; } catch (e) {}   // song begins exactly with the video, even if autoplay had started it early
    play();                                   // the tap is a user gesture: music starts with the ribbon
    hint.classList.add('hide');
    video.loop = false;
    video.addEventListener('playing', function () { video.removeAttribute('poster'); }, { once: true });
    var p = video.play();
    if (p && p.catch) p.catch(finish);
    // the clip ends on the hands photo (same as the hero): fade out once the card has fully opened
    var watch = setInterval(function () {
      if (video.currentTime >= 6.2 || finished) { clearInterval(watch); finish(); }
    }, 40);
    video.addEventListener('ended', finish, { once: true });
    video.addEventListener('error', finish, { once: true });
    setTimeout(finish, 10000);                 // safety net
  }
  cover.addEventListener('pointerup', openInvite);   // fires as soon as the finger lifts, so the song starts with no extra delay
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
