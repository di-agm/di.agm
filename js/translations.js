window.addEventListener("DOMContentLoaded", () => {
    const userLang = navigator.language.slice(0, 2);
    const supportedLangs = ["en", "es", "pt", "fr", "ru", "de", "ja", "hi"];
    const lang = supportedLangs.includes(userLang) ? userLang : "en";
    
    const script = document.createElement("script");
    script.src = `js/translations/${lang}.js`;
    script.onload = () => {
        if (window.translations) updateTranslations();
    };
    document.head.appendChild(script);

    // Defino updateTranslations dentro para que esté disponible cuando se cargue el script
    function updateTranslations() {
        console.log("Updating translations");
        const t = window.translations;
        
        const hello = document.getElementById("hello");
        if (hello && t.hello) hello.textContent = t.hello;
    
        if (t.follow) {
            document.querySelectorAll(".follow").forEach(el => el.textContent = t.follow);
        }
    
        if (t.stores) {
            document.querySelectorAll(".stores").forEach(el => el.textContent = t.stores);
        }
    }
});
