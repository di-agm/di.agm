//TRANSLATIONS
const userLang = navigator.language.slice(0, 2);
const supportedLangs = ['en', 'es', 'pt', 'fr', 'ru', 'de', 'ja', 'hi'];
const lang = supportedLangs.includes(userLang) ? userLang : 'en';

import(`./lang/${lang}.js`).then(module => {
    const t = module.default;

    document.getElementById("hello").textContent = t.hello;

    const followText = document.getElementById("follow");
    if (followText) followText.textContent = t.follow;

    const storesText = document.getElementById("stores");
    if (storesText) storesText.textContent = t.stores;

    document.querySelectorAll(".follow").forEach(el => el.textContent = t.follow);
    document.querySelectorAll(".stores").forEach(el => el.textContent = t.stores);
});
