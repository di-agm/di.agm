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
//COLOR
const colorRing = document.getElementById("colorRing");
        const ringKnob = document.getElementById("ringKnob");    

        const valueRing = document.getElementById("valueRing");
        const valueKnob = document.getElementById("valueKnob");

        let currentHue = 0;
        let currentSaturation = 100;
        let currentValue = 90;

        let clickedLogo = false;

        const logo = document.getElementById('logoWrapper');
        logo.addEventListener('mousedown', (e) => {
            clickedLogo = true;
        });

        function updateBackground() {
            const h = currentHue;
            const s = currentSaturation;
            const l = currentValue;

            // Actualizar fondo
            document.documentElement.style.setProperty('--bg', `hsl(${h}, ${s}%, ${l}%)`);

            // Calcular si es claro u oscuro
            const isLight = l > 30;

            // Cambiar color del texto en consecuencia
            document.documentElement.style.setProperty('--fg', isLight ? "#000" : "#fff");

            // También puedes cambiar el color de botones/enlaces si quieres
            document.querySelectorAll('.links a').forEach(link => {
                link.style.backgroundColor = "transparent"; // elimina fondo negro
                link.style.color = isLight ? "#000" : "#fff";
            });
        }

        function setHue(hue) {
            currentHue = hue;
            // Move knob
            const angle = (hue - 90) * Math.PI / 180; // -90 to start at top
            const ringRect = colorRing.getBoundingClientRect();
            const radius = ringRect.width / 3
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            ringKnob.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
            ringKnob.style.borderColor = `hsl(${hue}, 100%, 50%)`;
            updateBackground();
            updateProfileLink();
        }

        // Helper to get angle from center
        function getHueFromEvent(e) {
            const rect = colorRing.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            console.log("Center:", cx, cy);
            const x = (e.touches ? e.touches[0].clientX : e.clientX) - cx;
            const y = (e.touches ? e.touches[0].clientY : e.clientY) - cy;
            let angle = Math.atan2(y, x) * 180 / Math.PI + 90;
            if (angle < 0) angle += 360;
            return Math.round(angle);
        }
        // Value (brightness) control
        function setValue(value) {
            currentValue = value;
            const angle = (value/100*360) - 90;
            const rad = angle * Math.PI/180;
            const ringRect = colorRing.getBoundingClientRect();
            const radius = ringRect.width / 2 - 20
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;
            valueKnob.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
            valueKnob.style.borderColor = `hsl(${currentHue}, ${currentSaturation}%, ${currentValue}%)`;
            currentValue = value;
            updateBackground();
            updateProfileLink();
        }
        function getValueFromEvent(e) {
            const rect = valueRing.getBoundingClientRect();
            const cx = rect.left + rect.width/2;
            const cy = rect.top + rect.height/2;
            const x = (e.touches ? e.touches[0].clientX : e.clientX) - cx;
            const y = (e.touches ? e.touches[0].clientY : e.clientY) - cy;
            let angle = Math.atan2(y, x)*180/Math.PI+90;
            if(angle<0) angle+=360;
            return Math.round(angle/360*100);
        }

        let draggingHue = false;
        let draggingValue = false;

        // Add event listeners for hue
        colorRing.addEventListener('mousedown', (e) => { 
            const inner = document.querySelector('.color-ring-inner');
            if (inner.contains(e.target)) return; // Avoid color change if click was inside logo
            draggingHue = true;
            setHue(getHueFromEvent(e));
        });
        colorRing.addEventListener('touchstart', (e) => { 
            draggingHue = true;
            setHue(getHueFromEvent(e));
        });
        window.addEventListener('mousemove', (e) => { 
            if (clickedLogo) return;
            if (draggingHue) setHue(getHueFromEvent(e));
        });
        window.addEventListener('touchmove', (e) => { if(draggingHue) setHue(getHueFromEvent(e)); });
        window.addEventListener('mouseup', () => {
            draggingHue = false;
            clickedLogo = false;
        });
        window.addEventListener('touchend', () => draggingHue = false);

        // Add event listeners for value
        valueRing.addEventListener('mousedown', (e) => { draggingValue = true; setValue(getValueFromEvent(e)); });
        valueRing.addEventListener('touchstart', (e) => { draggingValue = true; setValue(getValueFromEvent(e)); });
        window.addEventListener('mousemove', (e) => { if(draggingValue) setValue(getValueFromEvent(e)); });
        window.addEventListener('touchmove', (e) => { if(draggingValue) setValue(getValueFromEvent(e)); });
        window.addEventListener('mouseup', () => draggingValue = false);
        window.addEventListener('touchend', () => draggingValue = false);

        // Set initial values
        setHue(0);
        setValue(90);

        logo.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') showmenu();
        });
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
