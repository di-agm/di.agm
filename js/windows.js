function showSectionFromHash() {
    const sections = ["home", "menu", "links", "stores", "am", "P", "CV", "Tools"];
    const hash = window.location.hash.slice(1) || "home"; // remove "#" or default to home

    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.style.display = (id === hash) ? "block" : "none";
        }
    });

    if (typeof updateTranslations === "function") {
        updateTranslations();
    }
}

window.addEventListener("DOMContentLoaded", showSectionFromHash);
window.addEventListener("hashchange", showSectionFromHash);
