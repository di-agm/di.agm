const translations = {};

async function loadTranslations() {
    const response = await fetch(`./translations/${navigator.language.slice(0, 2)}.json`);
    if (response.ok) {
        Object.assign(translations, await response.json());
    } else {
        const defaultResponse = await fetch('./translations/en.json');
        Object.assign(translations, await defaultResponse.json());
    }
}

function updateTranslations() {
    const hello = document.getElementById("hello");
    if (hello) hello.textContent = translations.hello;

    document.querySelectorAll(".follow").forEach(el => el.textContent = translations.follow);
    document.querySelectorAll(".stores").forEach(el => el.textContent = translations.stores);
}

loadTranslations().then(updateTranslations);
