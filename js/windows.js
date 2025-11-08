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
