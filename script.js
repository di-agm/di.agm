async function loadTranslations(lang) {
  try {
    const res = await fetch(`lang/${lang}.json`);
    if (!res.ok) throw new Error("No se encontró el archivo de idioma");
    const translations = await res.json();
    applyTranslations(translations);
  } catch {
    // Si no existe el idioma, carga inglés por defecto
    const res = await fetch(`lang/en.json`);
    const translations = await res.json();
    applyTranslations(translations);
  }
}

function applyTranslations(translations) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[key]) el.textContent = translations[key];
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Detecta idioma, toma solo código corto (ej: "en", "es")
  const userLang = navigator.language.slice(0, 2);
  loadTranslations(userLang);
});
