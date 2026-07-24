// Lógica de procesamiento de voz
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    alert("Tu navegador no soporta esta herramienta. Usa Google Chrome.");
} else {
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'es-MX';        // Ajustable según el español necesario
    recognition.continuous = true;     
    recognition.interimResults = true; 
    
    const pantallaTexto = document.getElementById('pantalla-texto');
    const btnMicrofono = document.getElementById('btn-microfono');
    
    let isListening = false;
    let historialConfirmado = '';

    recognition.onresult = (event) => {
        let textoTemporal = '';
        let textoConfirmado = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                textoConfirmado += event.results[i][0].transcript + '<br><br>';
            } else {
                textoTemporal += event.results[i][0].transcript;
            }
        }

        if (textoConfirmado !== '') {
            historialConfirmado += textoConfirmado;
        }

        pantallaTexto.innerHTML = 
            '<span class="confirmado">' + historialConfirmado + '</span>' +
            '<span class="escuchando">' + textoTemporal + '</span>';
            
        // Auto-scroll hacia abajo
        pantallaTexto.scrollTop = pantallaTexto.scrollHeight;
    };

    recognition.onerror = (event) => {
        console.error("Error en Escriba: ", event.error);
    };

    // Reconexión automática
    recognition.onend = () => {
        if (isListening) recognition.start();
    };

    // Interacción del usuario
    btnMicrofono.addEventListener('click', () => {
        if (!isListening) {
            recognition.start();
            isListening = true;
            btnMicrofono.textContent = "⏹ Detener Escriba";
            btnMicrofono.style.backgroundColor = "#333333";
        } else {
            isListening = false;
            recognition.stop();
            btnMicrofono.textContent = "🔴 Iniciar Escriba";
            btnMicrofono.style.backgroundColor = "#e50914";
        }
    });
}
