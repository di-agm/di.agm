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
