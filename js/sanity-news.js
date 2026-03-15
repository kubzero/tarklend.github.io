/**
 * TarkLend – News feed from Sanity.io
 * Set your project ID and dataset below after creating a project at https://www.sanity.io
 */
(function () {
  'use strict';

  var SANITY_PROJECT_ID = 'b9gnaqq4';
  var SANITY_DATASET = 'production';
  var API_VERSION = '2025-01-01';

  var LANG_STORAGE_KEY = 'tarklend-lang';
  var LANG_SUPPORTED = ['et', 'ru', 'en', 'uk'];

  /* GROQ: filter by type + current language. */
  var GROQ = '*[_type in ["newsPost", "post", "tarklend_post"] && lower(lang) == $lang] { _id, title, lang, publishedAt, "date": date, excerpt, "plaintextBody": pt::text(body), "imageUrl": mainImage.asset->url, "imageUrlAlt": image.asset->url, "sortDate": coalesce(publishedAt, date) } | order(sortDate desc) [0...50]';

  function normalizeLang(value) {
    if (!value) return '';
    var v = String(value).toLowerCase().split('-')[0];
    return LANG_SUPPORTED.indexOf(v) !== -1 ? v : '';
  }

  function getNewsLang() {
    var htmlLang = normalizeLang(document.documentElement.lang);
    if (htmlLang) return htmlLang;

    var stored = normalizeLang(localStorage.getItem(LANG_STORAGE_KEY));
    return stored || 'et';
  }

  function getNewsUrl(lang) {
    var l = lang && LANG_SUPPORTED.indexOf(lang) !== -1 ? lang : 'et';
    var base = 'https://' + SANITY_PROJECT_ID + '.api.sanity.io/v' + API_VERSION + '/data/query/' + SANITY_DATASET;
    /* HTTP query params are JSON values; strings must be quoted. */
    return base + '?query=' + encodeURIComponent(GROQ) + '&$lang=' + encodeURIComponent(JSON.stringify(l));
  }

  function getNewsText(key) {
    var lang = getNewsLang();
    var loc = window.LOCALES && window.LOCALES[lang];
    var fallback = window.LOCALES && window.LOCALES.et;
    return (loc && loc.news && loc.news[key]) || (fallback && fallback.news && fallback.news[key]) || '';
  }

  function filterItemsByLang(items, lang) {
    if (!Array.isArray(items)) return [];
    var normalizedLang = normalizeLang(lang) || 'et';
    return items.filter(function (item) {
      return normalizeLang(item && item.lang) === normalizedLang;
    });
  }

  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(document.documentElement.lang || 'et', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function renderFeed(container, items) {
    if (!container || !Array.isArray(items)) return;
    if (items.length === 0) {
      container.innerHTML = '<p class="news-empty">' + escapeHtml(getNewsText('empty') || 'Uudiseid pole.') + '</p>';
      return;
    }
    var html = items.map(function (post, i) {
      var imgUrl = post.imageUrl || post.imageUrlAlt;
      var imgWrap = imgUrl
        ? '<div class="news-card__img-wrap"><img src="' + escapeAttr(imgUrl) + '" alt="" class="news-card__img" loading="lazy"></div>'
        : '';
      var excerpt = post.excerpt ? '<p class="news-card__excerpt">' + escapeHtml(post.excerpt) + '</p>' : '';
      var bodyText = post.plaintextBody ? '<div class="news-card__body-text">' + escapeHtml(post.plaintextBody) + '</div>' : '';
      var date = formatDate(post.publishedAt || post.date);
      var delay = i % 6;
      return (
        '<article class="news-card news-card--animate" style="--card-delay: ' + delay + '" data-index="' + i + '">' +
        '<div class="news-card__accent"></div>' +
        imgWrap +
        '<div class="news-card__body">' +
        '<time class="news-card__date" datetime="' + escapeAttr(post.publishedAt || post.date || '') + '">' + escapeHtml(date) + '</time>' +
        '<h2 class="news-card__title">' + escapeHtml(post.title || '') + '</h2>' +
        excerpt +
        bodyText +
        '</div>' +
        '</article>'
      );
    }).join('');
    container.innerHTML = html;
  }

  function escapeHtml(s) {
    if (s == null) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function escapeAttr(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function run() {
    var container = document.getElementById('news-feed');
    if (!container) return;

    if (!SANITY_PROJECT_ID || SANITY_PROJECT_ID === 'YOUR_PROJECT_ID') {
      var notConfigured = getNewsText('notConfigured') || 'Uudiste voog pole seadistatud. Lisa Sanity projekti ID faili';
      container.innerHTML = '<p class="news-empty">' + escapeHtml(notConfigured) + ' <code>js/sanity-news.js</code>.</p>';
      return;
    }

    container.classList.add('news-feed--loading');
    var lang = getNewsLang();
    fetch(getNewsUrl(lang))
      .then(function (res) { return res.json(); })
      .then(function (data) {
        container.classList.remove('news-feed--loading');
        var items = filterItemsByLang((data && data.result) ? data.result : [], lang);
        renderFeed(container, items);
      })
      .catch(function () {
        container.classList.remove('news-feed--loading');
        container.innerHTML = '<p class="news-empty">' + escapeHtml(getNewsText('loadFailed') || 'Uudiste laadimine ebaõnnestus.') + '</p>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  document.addEventListener('tarklend:langChange', function () {
    if (!SANITY_PROJECT_ID || SANITY_PROJECT_ID === 'YOUR_PROJECT_ID') return;
    run();
  });
})();
