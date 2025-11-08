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
    if (!response.ok) throw new Error('File not found');
    const html = await response.text();

    // Insert the new section into the page
    const container = document.getElementById('contentContainer');
    container.innerHTML = html;

    // Hide the menu (optional)
    document.getElementById('menu').style.display = 'none';
    
    // You can call section-specific initializers here
    if (path.includes('tools.html') && typeof initTools === 'function') {
      initTools();
    }

  } catch (err) {
    console.error(err);
    document.getElementById('contentContainer').innerHTML = '<p>Error loading section.</p>';
  }
}
