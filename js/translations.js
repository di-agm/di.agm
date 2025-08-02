//TRANSLATIONS
const translations = {
        en: { hello: "Hello", follow: "Follow me on social media", stores:"Store" },
        es: { hello: "Hola", follow: "Sígueme en redes sociales", stores:"Tienda" },
        pt: { hello: "Olá", follow: "Siga-me nas redes sociais", stores:"Loja" },
        fr: { hello: "Bonjour", follow: "Suivez-moi sur les réseaux sociaux", stores:"Magasin" },
        ru: { hello: "Привет", follow: "Подпишитесь на меня в соцсетях", stores:"Магазин" },
        de: { hello: "Hallo", follow: "Folge mir in den sozialen Medien", stores:"Laden" },
        ja: { hello: "やあ", follow: "SNSでフォローしてね", stores:"店" },
        hi: { hello: "नमस्ते", follow: "सोशल मीडिया पर मुझे फॉलो करें", stores:"दुकान" }
        };

        const userLang = navigator.language.slice(0, 2);
        const lang = translations[userLang] ? userLang : "en";

        document.getElementById("hello").textContent = translations[lang].hello;
        const followText = document.getElementById("follow");
        if (followText) {
            followText.textContent = translations[lang].follow;
        }
        const storesText = document.getElementById("stores");
        if (storesText) {
            storesText.textContent = translations[lang].stores;
        }
function updateTranslations() {
            const t = translations[lang];

            const hello = document.getElementById("hello");
            if (hello) hello.textContent = t.hello;

            document.querySelectorAll(".follow").forEach(el => el.textContent = t.follow);
            document.querySelectorAll(".stores").forEach(el => el.textContent = t.stores);
        }

        updateTranslations();
