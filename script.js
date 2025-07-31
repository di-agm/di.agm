//WINDOWS
function showhome() {
            document.getElementById("home").style.display = "block";
            document.getElementById("links").style.display = "none";
            document.getElementById("menu").style.display = "none";
            document.getElementById("help").style.display = "none";
            updateTranslations();
            window.location.hash = "#home";
        }
        
        function showmenu() {
            document.getElementById("home").style.display = "none";
            document.getElementById("links").style.display = "none";
            document.getElementById("menu").style.display = "block";
            document.getElementById("help").style.display = "none";
            updateTranslations();
            window.location.hash = "#menu";
        }
        
        function showlinks() {
            document.getElementById("home").style.display = "none";
            document.getElementById("links").style.display = "block";
            document.getElementById("menu").style.display = "none";
            document.getElementById("help").style.display = "none";
            updateTranslations();
            window.location.hash = "#links";
        }
        
        function showhelp() {
            document.getElementById("home").style.display = "none";
            document.getElementById("links").style.display = "none";
            document.getElementById("menu").style.display = "none";
            document.getElementById("help").style.display = "block";
            updateTranslations();
            window.location.hash = "#help";
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
//TRANSLATIONS
const translations = {
        en: { hello: "Hello", follow: "Follow me on social media", support:"Your support really helps" },
        es: { hello: "Hola", follow: "Sígueme en redes sociales", support:"Tu apoyo realmente ayuda" },
        pt: { hello: "Olá", follow: "Siga-me nas redes sociais", support:"Seu apoio realmente ajuda" },
        fr: { hello: "Bonjour", follow: "Suivez-moi sur les réseaux sociaux", support:"Votre soutien aide vraiment" },
        ru: { hello: "Привет", follow: "Подпишитесь на меня в соцсетях", support:"Ваша поддержка действительно помогает" },
        de: { hello: "Hallo", follow: "Folge mir in den sozialen Medien", support:"Deine Unterstützung hilft wirklich" },
        ja: { hello: "やあ", follow: "SNSでフォローしてね", support:"あなたのサポートは本当に助かります" },
        hi: { hello: "नमस्ते", follow: "सोशल मीडिया पर मुझे फॉलो करें", support:"आपका समर्थन वास्तव में मदद करता है" }
        };

        const userLang = navigator.language.slice(0, 2);
        const lang = translations[userLang] ? userLang : "en";

        document.getElementById("hello").textContent = translations[lang].hello;
        const followText = document.getElementById("follow");
        if (followText) {
            followText.textContent = translations[lang].follow;
        }
        const supportText = document.getElementById("support");
        if (supportText) {
            supportText.textContent = translations[lang].support;
        }
function updateTranslations() {
            const t = translations[lang];

            const hello = document.getElementById("hello");
            if (hello) hello.textContent = t.hello;

            document.querySelectorAll(".follow").forEach(el => el.textContent = t.follow);
            document.querySelectorAll(".support").forEach(el => el.textContent = t.support);
        }

        updateTranslations();
