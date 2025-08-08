const translations = {};

async function loadTranslations() {
    const lang = navigator.language.slice(0, 2);
    let response = await fetch(`./Translations/${lang}.json`);
    if (!response.ok) {
        response = await fetch('./Translations/en.json');
    }
    Object.assign(translations, await response.json());
}

function updateTranslations() {
    const hello = document.getElementById("hello");
    if (hello) hello.textContent = translations.hello;

    document.querySelectorAll(".follow").forEach(el => el.textContent = translations.follow);
    document.querySelectorAll(".stores").forEach(el => el.textContent = translations.stores);
    document.querySelectorAll(".AM").forEach(el => el.textContent = translations.AM);
    document.querySelectorAll(".Portfolio").forEach(el => el.textContent = translations.Portfolio);
    document.querySelectorAll(".Skills").forEach(el => el.textContent = translations.Skills);
    document.querySelectorAll(".Tools").forEach(el => el.textContent = translations.Tools);
    document.querySelectorAll(".J29-11").forEach(el => el.textContent = translations.J29-11);
}

document.addEventListener("DOMContentLoaded", () => {
    loadTranslations().then(updateTranslations);
});

function googleTranslateElementInit() {
    new google.translate.TranslateElement(
        {
            pageLanguage: 'es',
            includedLanguages: 'es,en,fr,de,pt,ja,ru',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE
        },
        'google_translate_element'
    );
}
