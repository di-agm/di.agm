window.addEventListener("DOMContentLoaded", () => {
    const userLang = navigator.language.slice(0, 2);
    const supportedLangs = ["en", "es", "pt", "fr", "ru", "de", "ja", "hi"];
    const lang = supportedLangs.includes(userLang) ? userLang : "en";

    loadLanguage(lang, () => {
        updateTranslations();
        checkMissingKeys(lang);
    });

    function loadLanguage(langCode, callback) {
        const script = document.createElement('script');
        script.src = `translations/${langCode}.js`;
        script.onload = () => callback();
        script.onerror = () => {
            console.warn(`Could not load ${langCode}.js, falling back to en.js`);
            if (langCode !== 'en') loadLanguage('en', callback);
        };
        document.head.appendChild(script);
    }

    function updateTranslations() {
        const t = translations;

        const hello = document.getElementById("hello");
        if (hello && t.hello) hello.textContent = t.hello;

        if (t.follow) {
            document.querySelectorAll(".follow").forEach(el => el.textContent = t.follow);
        }

        if (t.stores) {
            document.querySelectorAll(".stores").forEach(el => el.textContent = t.stores);
        }
    }

    function checkMissingKeys(langCode) {
        const required = ["hello", "follow", "stores"];
        required.forEach(key => {
            if (!translations[key]) console.warn(`Missing translation: ${langCode}.${key}`);
        });
    }
});
