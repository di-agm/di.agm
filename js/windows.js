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

function setupImageOverlays() {
    const images = document.querySelectorAll('#P img'); 
    images.forEach(img => {
        if (img.parentElement.classList.contains('image-container')) {
            return;
        }

        const description = img.getAttribute('data-description') || 'No hay descripción';
        const container = document.createElement('div');
        container.className = 'image-container';
        const overlay = document.createElement('div');
        overlay.className = 'image-overlay';        
        const text = document.createElement('span');
        text.className = 'overlay-text';
        text.textContent = description;
        
        overlay.appendChild(text);

        img.parentNode.insertBefore(container, img);
        container.appendChild(img);
        container.appendChild(overlay);
        container.addEventListener('click', (event) => {
            container.classList.toggle('active');
        });
    });
}

document.addEventListener('DOMContentLoaded', setupImageOverlays);
