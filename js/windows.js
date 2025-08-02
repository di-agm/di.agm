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
            window.location.hash = "#home";
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
            window.location.hash = "#menu";
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
            window.location.hash = "#links";
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
            window.location.hash = "#help";
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
            window.location.hash = "#am";
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
            window.location.hash = "#P";
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
            window.location.hash = "#CV";
}

function showSectionFromHash() {
            switch (window.location.hash) {
                case "#menu":
                    showmenu(false);
                    break;
                case "#links":
                    showlinks(false);
                    break;
                case "#help":
                    showhelp(false);
                    break;
                default:
                    showhome(false);
            }
}

// On page load, show the correct section
window.addEventListener("DOMContentLoaded", showSectionFromHash);
// When the hash changes (back/forward), show the correct section
window.addEventListener("hashchange", showSectionFromHash);
