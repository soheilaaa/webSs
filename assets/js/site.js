/* Trusse editorial site: header, menu, product showcase, scroll reveal and the waiting-list form. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- Announcement bar ---------- */
  var barClose = $('bar-close');
  if (barClose) {
    barClose.addEventListener('click', function () {
      document.body.classList.add('bar-closed');
      $('bar').hidden = true;
      var brand = document.querySelector('.nav__brand');
      if (brand) brand.focus();
    });
  }

  /* ---------- Header turns dark over dark sections ---------- */
  var top = $('site-top');
  var darkZones = Array.prototype.slice.call(document.querySelectorAll('[data-theme="dark"]'));
  var ticking = false;
  var updateHeader = function () {
    ticking = false;
    if (!top) return;
    var probe = top.getBoundingClientRect().bottom - 8;
    var dark = darkZones.some(function (el) {
      var r = el.getBoundingClientRect();
      return r.top <= probe && r.bottom >= probe;
    });
    top.classList.toggle('is-dark', dark);
  };
  var onScroll = function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(updateHeader); }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateHeader();

  /* ---------- Mobile menu ---------- */
  var menu = $('menu');
  var openBtn = $('menu-open');
  var closeBtn = $('menu-close');
  if (menu && openBtn && closeBtn) {
    var focusables = function () {
      return Array.prototype.slice.call(menu.querySelectorAll('a[href], button'));
    };
    var openMenu = function () {
      menu.hidden = false;
      document.body.classList.add('menu-open');
      openBtn.setAttribute('aria-expanded', 'true');
      closeBtn.focus();
    };
    var closeMenu = function (returnFocus) {
      menu.hidden = true;
      document.body.classList.remove('menu-open');
      openBtn.setAttribute('aria-expanded', 'false');
      if (returnFocus) openBtn.focus();
    };
    openBtn.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', function () { closeMenu(true); });
    menu.addEventListener('click', function (ev) {
      if (ev.target.closest('a[href^="#"]')) closeMenu(false);
    });
    document.addEventListener('keydown', function (ev) {
      if (menu.hidden) return;
      if (ev.key === 'Escape') { closeMenu(true); return; }
      if (ev.key === 'Tab') {
        var f = focusables();
        var first = f[0], last = f[f.length - 1];
        if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
        else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
      }
    });
    window.matchMedia('(min-width: 961px)').addEventListener('change', function (mq) {
      if (mq.matches && !menu.hidden) closeMenu(false);
    });
  }

  /* ---------- Links that pre-tick a box in the form ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-pick]'), function (link) {
    link.addEventListener('click', function () {
      var box = document.querySelector('#waitlist-form input[name="' + link.getAttribute('data-pick') + '"]');
      if (box) box.checked = true;
    });
  });

  /* ---------- Product showcase: auto-advancing list with a pause control ---------- */
  var showcase = $('showcase');
  if (showcase) {
    var items = Array.prototype.slice.call(showcase.querySelectorAll('.sc-item'));
    var pauseBtn = $('sc-pause');
    var pauseLabel = $('sc-pause-label');
    var DURATION = 7000;
    var desktop = window.matchMedia('(min-width: 961px)');
    var state = { index: 0, paused: reduceMotion, visible: false, start: 0, elapsed: 0, raf: 0 };

    var setActive = function (i) {
      state.index = i;
      items.forEach(function (item, k) {
        var on = k === i;
        item.classList.toggle('is-active', on);
        item.querySelector('.sc-tab').setAttribute('aria-expanded', on ? 'true' : 'false');
        item.querySelector('.sc-progress').style.width = '0';
      });
      state.elapsed = 0;
      state.start = performance.now();
    };

    var renderPause = function () {
      pauseLabel.textContent = state.paused ? 'Play' : 'Pause';
      pauseBtn.setAttribute('aria-label', state.paused ? 'Play slideshow' : 'Pause slideshow');
      pauseBtn.querySelector('.icon-pause').toggleAttribute('hidden', state.paused);
      pauseBtn.querySelector('.icon-play').toggleAttribute('hidden', !state.paused);
    };

    var running = function () { return !state.paused && state.visible && desktop.matches && !document.hidden; };

    var tick = function (now) {
      state.raf = 0;
      if (!running()) return;
      var t = state.elapsed + (now - state.start);
      var bar = items[state.index].querySelector('.sc-progress');
      bar.style.width = Math.min(100, (t / DURATION) * 100) + '%';
      if (t >= DURATION) {
        setActive((state.index + 1) % items.length);
      }
      state.raf = window.requestAnimationFrame(tick);
    };

    var resume = function () {
      if (state.raf || !running()) return;
      state.start = performance.now();
      state.raf = window.requestAnimationFrame(tick);
    };
    var halt = function () {
      if (!state.raf) return;
      window.cancelAnimationFrame(state.raf);
      state.raf = 0;
      state.elapsed += performance.now() - state.start;
    };

    items.forEach(function (item, k) {
      item.querySelector('.sc-tab').addEventListener('click', function () {
        if (!desktop.matches) return;
        halt();
        state.paused = true; // a person chose an item, so stop moving on by itself
        renderPause();
        setActive(k);
      });
    });

    pauseBtn.addEventListener('click', function () {
      state.paused = !state.paused;
      renderPause();
      if (state.paused) halt(); else resume();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        state.visible = entries[0].isIntersecting;
        if (state.visible) resume(); else halt();
      }, { threshold: 0.35 }).observe(showcase);
    } else {
      state.visible = true;
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) halt(); else resume(); });
    desktop.addEventListener('change', function () { if (desktop.matches) resume(); else halt(); });

    setActive(0);
    renderPause();
    resume();
  }

  /* ---------- Scroll reveal (below the fold only, never with reduced motion) ---------- */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var targets = document.querySelectorAll('main h2, .row, .point, .founder, .principle, .join__left, .form, .footer__cta');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    Array.prototype.forEach.call(targets, function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add('reveal');
        io.observe(el);
      }
    });
  }

  /* ---------- Waiting-list form ---------- */
  var form = $('waitlist-form');
  if (!form) return;
  form.noValidate = true;

  // On the live site, submitting opens an email to WAITLIST_EMAIL. Anywhere else (such as a
  // preview link) the form shows its confirmation without sending anything.
  var WAITLIST_EMAIL = 'contact@trusseai.com';
  var LIVE = /(^|\.)trusseai\.com$|\.netlify\.app$|^localhost$|^127\.0\.0\.1$/.test(location.hostname);

  var summary = $('wl-errors');
  var summaryList = $('wl-errors-list');
  var submitBtn = $('wl-submit');
  var submitError = $('wl-submit-error');
  var FIELDS = ['name', 'email', 'company', 'role', 'problem'];
  var value = function (data, key) { return String(data.get(key) || '').trim(); };

  var validate = function (data) {
    var e = {};
    if (!value(data, 'name')) e.name = 'Enter your full name';
    var email = value(data, 'email');
    if (!email) e.email = 'Enter your work email address';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter an email address in the correct format, like name@example.com';
    if (!value(data, 'company')) e.company = 'Enter your company name';
    if (!value(data, 'role')) e.role = 'Select your role';
    if (!value(data, 'problem')) e.problem = 'Tell us your biggest contract-management problem';
    return e;
  };

  var setFieldError = function (key, message) {
    var msg = $('wl-' + key + '-error');
    msg.hidden = !message;
    msg.querySelector('.msg').textContent = message || '';
    var input = $('wl-' + key);
    input.classList.toggle('is-invalid', !!message);
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (message) input.setAttribute('aria-describedby', 'wl-' + key + '-error');
    else if (key !== 'wish') input.removeAttribute('aria-describedby');
  };

  var showErrors = function (errors) {
    summaryList.textContent = '';
    FIELDS.forEach(function (key) {
      setFieldError(key, errors[key]);
      if (!errors[key]) return;
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#wl-' + key;
      a.textContent = errors[key];
      a.addEventListener('click', function (ev) {
        ev.preventDefault();
        var el = $('wl-' + key);
        el.focus();
        el.scrollIntoView({ block: 'center' });
      });
      li.appendChild(a);
      summaryList.appendChild(li);
    });
    var has = summaryList.children.length > 0;
    summary.hidden = !has;
    if (has) summary.focus();
    return has;
  };

  var showDone = function (data, preview) {
    $('wl-first-name').textContent = value(data, 'name').split(/\s+/)[0] || 'there';
    $('wl-done-expo').hidden = !data.get('expo');
    $('wl-preview-note').hidden = !preview;
    $('wl-form-wrap').hidden = true;
    $('wl-done-wrap').hidden = false;
    $('wl-done').focus();
  };

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    submitError.hidden = true;
    var data = new FormData(form);
    if (showErrors(validate(data))) return;
    if (!LIVE) { showDone(data, true); return; }

    // No form backend yet: open the visitor's email app with the details filled in.
    var lines = [
      'Name: ' + value(data, 'name'),
      'Email: ' + value(data, 'email'),
      'Company: ' + value(data, 'company'),
      'Role: ' + value(data, 'role'),
      '',
      'Biggest contract-management problem:',
      value(data, 'problem'),
      '',
      'What I wish Trusse would solve:',
      value(data, 'wish') || '-',
      '',
      'At London Build Expo: ' + (data.get('expo') ? 'yes' : 'no'),
      'Send me updates: ' + (data.get('updates') ? 'yes' : 'no')
    ];
    location.href = 'mailto:' + WAITLIST_EMAIL +
      '?subject=' + encodeURIComponent('Trusse waiting list: ' + value(data, 'name')) +
      '&body=' + encodeURIComponent(lines.join('\r\n'));
    showDone(data, false);
  });
})();
