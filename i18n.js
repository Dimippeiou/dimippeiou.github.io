/* Ippeios bilingual site: static translations, no Google Translate */
(function () {
  'use strict';
  const dictionary = {};
  const buttons = () => document.querySelectorAll('[data-lang]');
  const supported = ['el','en'];
  function initialLanguage() {
    try {
      const saved = localStorage.getItem('language');
      if (supported.includes(saved)) return saved;
    } catch (_) {}
    return (navigator.language || 'el').toLowerCase().startsWith('el') ? 'el' : 'en';
  }
  let current = initialLanguage();
  function translate(lang) {
    const dict = dictionary[lang];
    if (!dict) return;
    current = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const value = dict[el.dataset.i18n];
      if (value !== undefined) el.textContent = value;
    });
    const attributes = ['alt','title','placeholder','aria-label','content'];
    document.querySelectorAll('*').forEach(el => {
      attributes.forEach(attr => {
        const key = el.getAttribute('data-i18n-' + attr);
        if (key && dict[key] !== undefined) el.setAttribute(attr, dict[key]);
      });
    });
    const titleKey = document.title && document.querySelector('title[data-i18n-attr-text]')?.getAttribute('data-i18n-attr-text');
    if (titleKey && dict[titleKey]) document.title = dict[titleKey];
    buttons().forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
      btn.classList.toggle('selected',btn.dataset.lang === lang);
    });
    try {localStorage.setItem('language',lang);} catch (_) {}
  }
  async function init() {
    buttons().forEach(btn => btn.addEventListener('click', () => translate(btn.dataset.lang)));
    try {
      const files = await Promise.all(['el','en'].map(lang => fetch(lang + '.json').then(r => {
        if (!r.ok) throw new Error('Translation unavailable: '+lang);
        return r.json();
      })));
      dictionary.el = files[0]; dictionary.en = files[1];
      translate(current);
    } catch (err) {
      console.error('Translation files could not be loaded. Site stays in Greek.',err);
      document.documentElement.lang='el';
      buttons().forEach(b => b.disabled = true);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
