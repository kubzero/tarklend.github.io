(function () {
  'use strict';

  var STORAGE_KEY = 'tarklend-lang';
  var SUPPORTED = ['et', 'ru', 'en', 'uk'];

  function getLang() {
    var stored = localStorage.getItem(STORAGE_KEY);
    return stored && SUPPORTED.indexOf(stored) !== -1 ? stored : 'et';
  }

  function setLang(code) {
    if (SUPPORTED.indexOf(code) === -1) return;
    localStorage.setItem(STORAGE_KEY, code);
    applyLocale(code);
    closeDropdown();
    updateTriggerLabel(code);
    setOptionSelected(code);
    document.documentElement.lang = code === 'uk' ? 'uk' : code === 'et' ? 'et' : code === 'ru' ? 'ru' : 'en';
  }

  function getText(obj, key) {
    var parts = key.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      cur = cur && cur[parts[i]];
    }
    return cur != null ? String(cur) : '';
  }

  function applyLocale(code) {
    var loc = window.LOCALES && window.LOCALES[code];
    if (!loc) return;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var text = getText(loc, key);
      if (text) el.textContent = text;
    });
  }

  function updateTriggerLabel(code) {
    var trigger = document.getElementById('lang-trigger');
    var label = trigger && trigger.querySelector('.lang-trigger-label');
    if (label) label.textContent = code.toUpperCase();
  }

  function setOptionSelected(code) {
    document.querySelectorAll('.lang-option').forEach(function (btn) {
    btn.setAttribute('aria-selected', btn.getAttribute('data-lang') === code ? 'true' : 'false');
    });
  }

  var dropdown = document.getElementById('lang-dropdown');
  var trigger = document.getElementById('lang-trigger');

  function openDropdown() {
    if (dropdown) dropdown.classList.add('is-open');
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'true');
      trigger.setAttribute('aria-label', 'Vali keel');
    }
    document.addEventListener('click', outsideClose);
  }

  function closeDropdown() {
    if (dropdown) dropdown.classList.remove('is-open');
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
    }
    document.removeEventListener('click', outsideClose);
  }

  function toggleDropdown() {
    var open = dropdown && dropdown.classList.contains('is-open');
    if (open) closeDropdown(); else openDropdown();
  }

  function outsideClose(e) {
    if (!trigger || !dropdown) return;
    if (trigger.contains(e.target) || dropdown.contains(e.target)) return;
    closeDropdown();
  }

  if (trigger) {
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleDropdown();
    });
  }

  document.querySelectorAll('.lang-option').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var code = this.getAttribute('data-lang');
      if (code) setLang(code);
    });
  });

  var current = getLang();
  applyLocale(current);
  updateTriggerLabel(current);
  setOptionSelected(current);
  document.documentElement.lang = current === 'uk' ? 'uk' : current === 'et' ? 'et' : current === 'ru' ? 'ru' : 'en';

  /* Custom cursor at 1/3 size – follows mouse; pointer same size over links/buttons */
  (function () {
    var dot = document.getElementById('cursor-dot');
    if (!dot) return;
    var hot = 8;
    var raf = null;
    var x = 0;
    var y = 0;
    var pointerSelector = 'a, button, [role="button"], input[type="submit"], input[type="button"], .nav-link, .lang-trigger, .lang-option, .footer-icon';

    function move(e) {
      x = e.clientX;
      y = e.clientY;
      var target = e.target;
      var isPointer = target && target.closest && target.closest(pointerSelector);
      if (isPointer) {
        dot.classList.add('is-pointer');
      } else {
        dot.classList.remove('is-pointer');
      }
      if (raf == null) {
        raf = requestAnimationFrame(function () {
          raf = null;
          dot.style.left = (x - hot) + 'px';
          dot.style.top = (y - hot) + 'px';
        });
      }
    }

    document.addEventListener('mousemove', move, { passive: true });
    document.addEventListener('mouseenter', function () {
      dot.classList.remove('is-hidden');
    });
    document.addEventListener('mouseleave', function () {
      dot.classList.add('is-hidden');
    });
    move({ clientX: 0, clientY: 0, target: document.body });
  })();
})();
