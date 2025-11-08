function showSectionFromHash() {
    const sections = ["home", "menu", "links", "stores", "AM", "P", "CV", "Tools", "tt", "LS", "layout"];
    const hash = window.location.hash.slice(1) || "home"; // remove "#" or default to home

    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.style.display = (id === hash) ? "block" : "none";
            console.log("Showing section:", hash);
       }
    });

    if (typeof updateTranslations === "function") {
        updateTranslations();
    }
}

window.addEventListener("DOMContentLoaded", showSectionFromHash);
window.addEventListener("hashchange", showSectionFromHash);

async function loadSection(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    const html = await response.text();

    const container = document.getElementById('contentContainer');
    container.innerHTML = html;
    container.style.display = 'block';

    const home = document.getElementById('home');
    const menu = document.getElementById('menu');
    if (home) home.style.display = 'none';
    if (menu) menu.style.display = 'none';

    console.log(`✅ Loaded section: ${path}`);
  } catch (err) {
    console.error("❌ Error loading section:", err);
  }
}

function showTool(id) {
  document.querySelectorAll('#contentContainer > h1, #contentContainer > h2').forEach(el => el.style.display = 'none');
  document.querySelectorAll('#contentContainer > div').forEach(div => {
    div.style.display = (div.id === id ? 'block' : 'none');
  });
  if (id === 'layout' && typeof initLayout === 'function') initLayout();
  if (id === 'tt' && typeof initTimetable === 'function') initTimetable();
}
