window.addEventListener("DOMContentLoaded", () => {
  const userLang = navigator.language.slice(0, 2);
  const supportedLangs = ['en', 'es', 'pt', 'fr', 'ru', 'de', 'ja', 'hi'];
  const lang = supportedLangs.includes(userLang) ? userLang : 'en';

  import(`./lang/${lang}.js`)
    .then(module => {
      const t = module.default;

      const hello = document.getElementById("hello");
      if (hello) hello.textContent = t.hello;

      const followText = document.getElementById("follow");
      if (followText) followText.textContent = t.follow;

      const storesText = document.getElementById("stores");
      if (storesText) storesText.textContent = t.stores;

      document.querySelectorAll(".follow").forEach(el => el.textContent = t.follow);
      document.querySelectorAll(".stores").forEach(el => el.textContent = t.stores);
    })
    .catch(error => {
      console.error("Error loading translation:", error);
    });
});
