/* ============================================================
   MONETA — Shared JS
   ============================================================ */

/* ── Nav scroll ──────────────────────────────────────────── */
(function () {
  var nav = document.querySelector('.nav');
  if (!nav) return;
  function onScroll() { nav.classList.toggle('nav--scrolled', window.scrollY > 20); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Mobile hamburger ────────────────────────────────────── */
(function () {
  var btn  = document.querySelector('.nav__hamburger');
  var menu = document.querySelector('.nav__mobile-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
})();

/* ── Reveal on scroll ────────────────────────────────────── */
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  els.forEach(function (el) { io.observe(el); });
})();

/* ── Contact modal ───────────────────────────────────────── */
(function () {
  var modal    = document.getElementById('contact-modal');
  var backdrop = modal && modal.querySelector('.contact-modal__backdrop');
  var closeBtn = modal && modal.querySelector('.contact-modal__close');
  if (!modal) return;
  function open()  { modal.hidden = false; document.body.style.overflow = 'hidden'; }
  function close() { modal.hidden = true;  document.body.style.overflow = ''; }
  document.querySelectorAll('a[href="#contact"]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); open(); });
  });
  if (backdrop) backdrop.addEventListener('click', close);
  if (closeBtn) closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  var form = document.getElementById('modal-demo-form');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = form.querySelector('.form-submit');
    btn.textContent = 'Sent \u2713';
    btn.style.background = '#78950E';
    btn.disabled = true;
  });
})();

/* ── Particle config (global so tweaks can modify it) ─────── */
var particleConfig = {
  num:        90,
  dist:       160,
  dotOpacity: 0.85,
  lineOpacity:0.35,
  speed:      1,
  dotSize:    1.2
};

/* ── Hero particle canvas ────────────────────────────────── */
(function () {
  var canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H, particles;

  function init() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    particles = [];
    for (var i = 0; i < particleConfig.num; i++) {
      var spd = 0.28 * particleConfig.speed;
      particles.push({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - 0.5) * spd,
        vy: (Math.random() - 0.5) * spd,
        r:  Math.random() * particleConfig.dotSize * 0.7 + particleConfig.dotSize * 0.4
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var d = particleConfig.dist;
    var lo = particleConfig.lineOpacity;
    var dop = particleConfig.dotOpacity;
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < d) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(59,148,208,' + (lo * (1 - dist / d)) + ')';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    for (var k = 0; k < particles.length; k++) {
      var p = particles[k];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59,148,208,' + dop + ')';
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    }
    requestAnimationFrame(draw);
  }

  window._reinitParticles = init;
  init();
  draw();
  window.addEventListener('resize', init);
})();

/* ── Tweaks panel ────────────────────────────────────────── */
(function () {
  var DEFAULTS = /*EDITMODE-BEGIN*/{"accentColor":"orange","cardStyle":"bordered","sectionDensity":"normal","particles":90,"dist":160,"dotOpacity":85,"lineOpacity":55,"speed":7}/*EDITMODE-END*/;
  var state = {};
  Object.keys(DEFAULTS).forEach(function (k) { state[k] = DEFAULTS[k]; });

  var panel = document.getElementById('tweaks-panel');
  if (!panel) return;

  function applyState() {
    var root = document.documentElement;
    if (state.accentColor === 'orange') root.style.setProperty('--orange', '#F36A22');
    else if (state.accentColor === 'blue') root.style.setProperty('--orange', '#3B94D0');
    else if (state.accentColor === 'teal') root.style.setProperty('--orange', '#1aada8');
    root.style.setProperty('--sp', state.sectionDensity === 'compact' ? '64px' : state.sectionDensity === 'airy' ? '120px' : '96px');
    document.querySelectorAll('.card, .outcome-card').forEach(function (c) {
      c.style.background = state.cardStyle === 'flat' ? 'transparent' : '';
    });
  }

  function applyParticles() {
    particleConfig.num         = state.particles   || 90;
    particleConfig.dist        = state.dist        || 160;
    particleConfig.dotOpacity  = (state.dotOpacity  || 85) / 100;
    particleConfig.lineOpacity = (state.lineOpacity || 35) / 100;
    particleConfig.speed       = (state.speed       || 5)  / 5;
    if (window._reinitParticles) window._reinitParticles();
  }

  function sync() {
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: state }, '*');
  }

  function mkSlider(id, label, min, max, val, unit) {
    return '<div style="margin-bottom:12px;">'
      + '<div style="display:flex;justify-content:space-between;margin-bottom:4px;">'
      + '<span style="font-size:0.75rem;color:#4a6070;">' + label + '</span>'
      + '<strong id="' + id + '-val" style="font-size:0.75rem;color:#2a3d52;">' + val + unit + '</strong>'
      + '</div>'
      + '<input type="range" id="' + id + '" min="' + min + '" max="' + max + '" value="' + val + '" '
      + 'style="width:100%;accent-color:#3B94D0;cursor:pointer;" />'
      + '</div>';
  }

  function buildPanel() {
    var html = '<h6>Tweaks</h6>';

    html += '<div style="font-size:0.6rem;letter-spacing:0.12em;text-transform:uppercase;color:#7a9ab0;margin-bottom:8px;">General</div>';

    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">';
    html += '<span style="font-size:0.75rem;color:#4a6070;">CTA Color</span>';
    html += '<select id="tw-accent" style="background:#e8f0f7;border:1px solid #c8d8e8;border-radius:3px;color:#2a3d52;font-size:0.75rem;padding:3px 6px;cursor:pointer;">';
    html += '<option value="orange"' + (state.accentColor==='orange'?' selected':'') + '>Orange</option>';
    html += '<option value="blue"'   + (state.accentColor==='blue'  ?' selected':'') + '>Blue</option>';
    html += '<option value="teal"'   + (state.accentColor==='teal'  ?' selected':'') + '>Teal</option>';
    html += '</select></div>';

    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">';
    html += '<span style="font-size:0.75rem;color:#4a6070;">Section Spacing</span>';
    html += '<select id="tw-density" style="background:#e8f0f7;border:1px solid #c8d8e8;border-radius:3px;color:#2a3d52;font-size:0.75rem;padding:3px 6px;cursor:pointer;">';
    html += '<option value="compact"' + (state.sectionDensity==='compact'?' selected':'') + '>Compact</option>';
    html += '<option value="normal"'  + (state.sectionDensity==='normal' ?' selected':'') + '>Normal</option>';
    html += '<option value="airy"'    + (state.sectionDensity==='airy'   ?' selected':'') + '>Airy</option>';
    html += '</select></div>';

    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">';
    html += '<span style="font-size:0.75rem;color:#4a6070;">Card Style</span>';
    html += '<select id="tw-card" style="background:#e8f0f7;border:1px solid #c8d8e8;border-radius:3px;color:#2a3d52;font-size:0.75rem;padding:3px 6px;cursor:pointer;">';
    html += '<option value="bordered"' + (state.cardStyle==='bordered'?' selected':'') + '>Bordered</option>';
    html += '<option value="flat"'     + (state.cardStyle==='flat'    ?' selected':'') + '>Flat</option>';
    html += '</select></div>';

    html += '<div style="font-size:0.6rem;letter-spacing:0.12em;text-transform:uppercase;color:#7a9ab0;margin-bottom:10px;border-top:1px solid #d8e5ef;padding-top:12px;">Particle Animation</div>';
    html += mkSlider('tw-particles', 'Particles',        20,  200, state.particles,    '');
    html += mkSlider('tw-dist',      'Connect Distance', 60,  300, state.dist,         'px');
    html += mkSlider('tw-dot',       'Dot Brightness',   10,  100, state.dotOpacity,   '%');
    html += mkSlider('tw-line',      'Line Brightness',  5,   100, state.lineOpacity,  '%');
    html += mkSlider('tw-speed',     'Speed',            1,   10,  state.speed,        'x');

    panel.innerHTML = html;

    panel.querySelector('#tw-accent').addEventListener('change', function (e) { state.accentColor = e.target.value; applyState(); sync(); });
    panel.querySelector('#tw-density').addEventListener('change', function (e) { state.sectionDensity = e.target.value; applyState(); sync(); });
    panel.querySelector('#tw-card').addEventListener('change', function (e) { state.cardStyle = e.target.value; applyState(); sync(); });

    function bindSlider(id, onChange) {
      var el  = panel.querySelector('#' + id);
      var lbl = panel.querySelector('#' + id + '-val');
      var unit = id === 'tw-dist' ? 'px' : (id === 'tw-dot' || id === 'tw-line') ? '%' : id === 'tw-speed' ? 'x' : '';
      el.addEventListener('input', function () {
        lbl.textContent = el.value + unit;
        onChange(parseFloat(el.value));
        sync();
      });
    }

    bindSlider('tw-particles', function (v) { state.particles = v; particleConfig.num = v; if (window._reinitParticles) window._reinitParticles(); });
    bindSlider('tw-dist',      function (v) { state.dist = v; particleConfig.dist = v; });
    bindSlider('tw-dot',       function (v) { state.dotOpacity = v; particleConfig.dotOpacity = v / 100; });
    bindSlider('tw-line',      function (v) { state.lineOpacity = v; particleConfig.lineOpacity = v / 100; });
    bindSlider('tw-speed',     function (v) { state.speed = v; particleConfig.speed = v / 5; if (window._reinitParticles) window._reinitParticles(); });
  }

  window.addEventListener('message', function (e) {
    if (!e.data || !e.data.type) return;
    if (e.data.type === '__activate_edit_mode')   { panel.classList.add('open');    buildPanel(); applyState(); applyParticles(); }
    if (e.data.type === '__deactivate_edit_mode') { panel.classList.remove('open'); }
  });

  window.parent.postMessage({ type: '__edit_mode_available' }, '*');

  applyState();
  applyParticles();
})();
