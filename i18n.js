/* Ippeios primary school: Greek-first, user-chosen bilingual content. No external translators. */
(() => {
  'use strict';
  const KEY = 'ippeios-language-choice-v2';
  const LOCALES = ['el', 'en'];
  const dictionary = {};
  const controls = () => document.querySelectorAll('[data-lang]');
  let locale = 'el';
  let ready = false;

  try {
    const explicit = localStorage.getItem(KEY);
    if (LOCALES.includes(explicit)) locale = explicit;
  } catch (error) { /* Greek remains the default */ }

  function render(target) {
    if (!ready || !LOCALES.includes(target)) return;
    const words = dictionary[target];
    document.documentElement.lang = target;
    document.querySelectorAll('[data-i18n]').forEach(node => {
      const message = words[node.getAttribute('data-i18n')];
      if (typeof message === 'string') node.textContent = message;
    });
    for (const name of ['alt','title','placeholder','aria-label','content']) {
      document.querySelectorAll('[data-i18n-' + name + ']').forEach(node => {
        const key = node.getAttribute('data-i18n-' + name);
        if (typeof words[key] === 'string') node.setAttribute(name,words[key]);
      });
    }
    const t = document.querySelector('title[data-i18n-attr-text]');
    if (t && typeof words[t.dataset.i18nAttrText] === 'string') document.title = words[t.dataset.i18nAttrText];
    controls().forEach(button => {
      const chosen = button.dataset.lang === target;
      button.classList.toggle('selected',chosen);
      button.setAttribute('aria-pressed',String(chosen));
    });
    locale=target;
  }

  async function start() {
    controls().forEach(button => button.addEventListener('click', () => {
      if (!ready) return;
      const target=button.dataset.lang;
      if (!LOCALES.includes(target)) return;
      try { localStorage.setItem(KEY,target); } catch (_) {}
      render(target);
    }));
    try {
      const [el,en] = await Promise.all(LOCALES.map(lang =>
        fetch('./'+lang+'.json', {cache:'no-cache'}).then(response => {
          if (!response.ok) throw new Error(lang + ': HTTP ' + response.status);
          return response.json();
        })
      ));
      dictionary.el=el;
      dictionary.en=en;
      ready=true;
      render(locale);
    } catch(error) {
      // Keep the original Greek HTML visible if anything fails.
      document.documentElement.lang='el';
      controls().forEach(button => { button.disabled=true; button.title='Translation temporarily unavailable'; });
      console.error('Ippeios translations could not be loaded',error);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
