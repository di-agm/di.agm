const translations = {};

async function loadTranslations() {
    const lang = navigator.language.slice(0, 2);
    let response = await fetch(`./translations/${lang}.json`);
    if (!response.ok) {
        response = await fetch('./translations/en.json');
    }
    Object.assign(translations, await response.json());
}

function updateTranslations() {
    const hello = document.getElementById("hello");
    if (hello) hello.textContent = translations.hello;

    document.querySelectorAll(".follow").forEach(el => el.textContent = translations.follow);
    document.querySelectorAll(".stores").forEach(el => el.textContent = translations.stores);
}

document.addEventListener("DOMContentLoaded", () => {
    loadTranslations().then(updateTranslations);
});
