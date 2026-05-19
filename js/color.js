// COLOR
const colorRing = document.getElementById("colorRing");
const ringKnob = document.getElementById("ringKnob");    

const valueRing = document.getElementById("valueRing");
const valueKnob = document.getElementById("valueKnob");
const logo = document.getElementById('logoWrapper');

let currentHue = 0;
let currentSaturation = 100;
let currentValue = 90;
let clickedLogo = false;

// Only add logo events if the logo actually exists on this page
if (logo) {
    logo.addEventListener('mousedown', (e) => {
        clickedLogo = true;
    });
    logo.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') showmenu();
    });
}

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
    localStorage.setItem("hue", hue);
    
    // ONLY move the knob if the ring actually exists on this page
    if (colorRing && ringKnob) {
        const angle = (hue - 90) * Math.PI / 180; // -90 to start at top
        const ringRect = colorRing.getBoundingClientRect();
        const radius = ringRect.width / 3;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        ringKnob.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
        ringKnob.style.borderColor = `hsl(${hue}, 100%, 50%)`;
    }
    
    updateBackground();
}

function setValue(value) {
    currentValue = value;
    localStorage.setItem("value", value);
    
    // ONLY move the knob if the ring actually exists on this page
    if (valueRing && valueKnob) {
        const angle = (value/100*360) - 90;
        const rad = angle * Math.PI/180;
        const ringRect = valueRing.getBoundingClientRect();
        const radius = ringRect.width / 2 - 20;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        valueKnob.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
        valueKnob.style.borderColor = `hsl(${currentHue}, ${currentSaturation}%, ${currentValue}%)`;
    }
    
    updateBackground();
}

// Helper to get angle from center
function getHueFromEvent(e) {
    const rect = colorRing.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - cx;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - cy;
    let angle = Math.atan2(y, x) * 180 / Math.PI + 90;
    if (angle < 0) angle += 360;
    return Math.round(angle);
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

// ONLY attach ring event listeners if the rings exist on this page
if (colorRing) {
    colorRing.addEventListener('mousedown', (e) => { 
        const inner = document.querySelector('.color-ring-inner');
        if (inner && inner.contains(e.target)) return; 
        draggingHue = true;
        setHue(getHueFromEvent(e));
    });
    colorRing.addEventListener('touchstart', (e) => { 
        draggingHue = true;
        setHue(getHueFromEvent(e));
    });
}

if (valueRing) {
    valueRing.addEventListener('mousedown', (e) => { draggingValue = true; setValue(getValueFromEvent(e)); });
    valueRing.addEventListener('touchstart', (e) => { draggingValue = true; setValue(getValueFromEvent(e)); });
}

// Global window events
window.addEventListener('mousemove', (e) => { 
    if (clickedLogo) return;
    if (draggingHue) setHue(getHueFromEvent(e));
    if (draggingValue) setValue(getValueFromEvent(e));
});
window.addEventListener('touchmove', (e) => { 
    if(draggingHue) setHue(getHueFromEvent(e)); 
    if(draggingValue) setValue(getValueFromEvent(e)); 
});
window.addEventListener('mouseup', () => {
    draggingHue = false;
    draggingValue = false;
    clickedLogo = false;
});
window.addEventListener('touchend', () => {
    draggingHue = false;
    draggingValue = false;
});

// Set initial values from memory (This will now run safely on every page!)
const savedHue = localStorage.getItem("hue");
const savedValue = localStorage.getItem("value");

setHue(savedHue !== null ? parseInt(savedHue) : 0);
setValue(savedValue !== null ? parseInt(savedValue) : 90);
