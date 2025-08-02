//WINDOWS
function showhome() {
            document.getElementById("home").style.display = "block";
            document.getElementById("links").style.display = "none";
            document.getElementById("menu").style.display = "none";
            document.getElementById("help").style.display = "none";
            document.getElementById("am").style.display = "none";
            document.getElementById("P").style.display = "none";
            document.getElementById("CV").style.display = "none";
            updateTranslations();
}

function showmenu() {
            document.getElementById("home").style.display = "none";
            document.getElementById("links").style.display = "none";
            document.getElementById("menu").style.display = "block";
            document.getElementById("help").style.display = "none";
            document.getElementById("am").style.display = "none";
            document.getElementById("P").style.display = "none";
            document.getElementById("CV").style.display = "none";
            updateTranslations();
}

function showlinks() {
            document.getElementById("home").style.display = "none";
            document.getElementById("links").style.display = "block";
            document.getElementById("menu").style.display = "none";
            document.getElementById("help").style.display = "none";
            document.getElementById("am").style.display = "none";
            document.getElementById("P").style.display = "none";
            document.getElementById("CV").style.display = "none";
            updateTranslations();
}

function showhelp() {
            document.getElementById("home").style.display = "none";
            document.getElementById("links").style.display = "none";
            document.getElementById("menu").style.display = "none";
            document.getElementById("help").style.display = "block";
            document.getElementById("am").style.display = "none";
            document.getElementById("P").style.display = "none";
            document.getElementById("CV").style.display = "none";
            updateTranslations();
}

function showam() {
            document.getElementById("home").style.display = "none";
            document.getElementById("links").style.display = "none";
            document.getElementById("menu").style.display = "none";
            document.getElementById("help").style.display = "none";
            document.getElementById("am").style.display = "block";
            document.getElementById("P").style.display = "none";
            document.getElementById("CV").style.display = "none";
            updateTranslations();
}

function showP() {
            document.getElementById("home").style.display = "none";
            document.getElementById("links").style.display = "none";
            document.getElementById("menu").style.display = "none";
            document.getElementById("help").style.display = "none";
            document.getElementById("am").style.display = "none";
            document.getElementById("P").style.display = "block";
            document.getElementById("CV").style.display = "none";
            updateTranslations();
}

function showCV() {
            document.getElementById("home").style.display = "none";
            document.getElementById("links").style.display = "none";
            document.getElementById("menu").style.display = "none";
            document.getElementById("help").style.display = "none";
            document.getElementById("am").style.display = "none";
            document.getElementById("P").style.display = "none";
            document.getElementById("CV").style.display = "block";
            updateTranslations();
}

function showSectionFromHash() {
    const hash = window.location.hash;

    if (!hash) {
        // If there's no hash, don't do anything
        return;
    }

    switch (hash) {
        case "#menu":
            showmenu();
            break;
        case "#links":
            showlinks();
            break;
        case "#help":
            showhelp();
            break;
        case "#am":
            showam();
            break;
        case "#P":
            showP();
            break;
        case "#CV":
            showCV();
            break;
    }
}

// On page load, show the correct section
window.addEventListener("DOMContentLoaded", showSectionFromHash);
// When the hash changes (back/forward), show the correct section
window.addEventListener("hashchange", showSectionFromHash);
