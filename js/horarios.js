const DAYS_OF_WEEK = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// --- Safe Math Parser ---
function evaluateMath(input) {
    if (!input) return 0;
    try {
        // Strip out everything except numbers, basic math operators, and parentheses
        const sanitized = String(input).replace(/[^0-9+\-*/.()]/g, '');
        if (!sanitized) return 0;
        
        // Safely evaluate the mathematical string
        const result = new Function(`return ${sanitized}`)();
        return Math.max(0, Math.round(result)); // Ensure we return a positive whole number
    } catch (error) {
        return 0; // Return 0 if the user types an invalid equation (like "5+*2")
    }
}
// --- Time Utilities ---
function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
}

function minutesToTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function gcdArray(numbers) {
    if (numbers.length === 0) return 30; // default interval
    return numbers.reduce((acc, n) => gcd(acc, n));
}

// --- UI State & Setup ---
let activityCount = 0;
let blockCount = 0;
let draggedElement = null;

function addActivity() {
    activityCount++;
    const container = document.getElementById('activitiesContainer');
    const template = document.getElementById('activity-template');
    const clone = template.content.cloneNode(true);
    const activityDiv = clone.querySelector('.activity-group');
    
    const activityId = `activity-${activityCount}`;
    activityDiv.id = activityId;
    
    // Drag & Drop
    activityDiv.addEventListener('dragstart', handleDragStart);
    activityDiv.addEventListener('dragover', handleDragOver);
    activityDiv.addEventListener('drop', handleDrop);
    
    activityDiv.querySelector('h4').textContent = `Actividad ${activityCount}`;
    activityDiv.querySelector('.remove-btn').onclick = () => activityDiv.remove();
    activityDiv.querySelector('.move-btn[data-action="up"]').onclick = () => moveActivity('up', activityId);
    activityDiv.querySelector('.move-btn[data-action="down"]').onclick = () => moveActivity('down', activityId);
    
    // Repeat Toggle
    const repeatCheck = activityDiv.querySelector('.activity-repeat-check');
    repeatCheck.addEventListener('change', () => {
        const typeSelect = activityDiv.querySelector('.activity-repeat-type');
        const intervalInput = activityDiv.querySelector('.activity-repeat-interval');
        typeSelect.disabled = !repeatCheck.checked;
        intervalInput.disabled = !repeatCheck.checked;
    });
    
    container.appendChild(clone);
}

function addBlock() {
    blockCount++;
    const container = document.getElementById('blocksContainer');
    const template = document.getElementById('block-template');
    const clone = template.content.cloneNode(true);
    const blockDiv = clone.querySelector('.block-group');
    
    blockDiv.id = `block-${blockCount}`;
    blockDiv.querySelector('h4').textContent = `Bloque No Accesible ${blockCount}`;
    blockDiv.querySelector('.remove-btn').onclick = () => blockDiv.remove();
    
    const daySelect = blockDiv.querySelector('.block-day');
    DAYS_OF_WEEK.forEach((day, index) => {
        const option = document.createElement('option');
        option.value = index + 1; // 1=Lunes, 7=Domingo
        option.textContent = day;
        daySelect.appendChild(option);
    });
    
    container.appendChild(clone);
}

// --- Drag & Drop Handlers ---
function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    const container = this.parentNode;
    const dragging = document.querySelector('.dragging');
    const siblings = [...container.querySelectorAll('.activity-group:not(.dragging)')];
    const next = siblings.find(sibling => e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2);
    container.insertBefore(dragging, next || null);
}

function handleDrop() {
    this.classList.remove('dragging');
    draggedElement = null;
}

function moveActivity(direction, id) {
    const element = document.getElementById(id);
    if (!element) return;
    const container = element.parentNode;
    if (direction === 'up' && element.previousElementSibling) {
        container.insertBefore(element, element.previousElementSibling);
    } else if (direction === 'down' && element.nextElementSibling) {
        container.insertBefore(element.nextElementSibling, element);
    }
}

// --- Core Generator Logic ---
function generateSchedule() {
    const scheduleTable = document.getElementById('scheduleTable');
    scheduleTable.innerHTML = ''; 

    // 1. Validar Entradas Base y usar el Evaluador Matemático
    const numDaysInput = document.getElementById('numDays').value.trim();
    const timeRangeInput = document.getElementById('timeRange').value.trim();
    const startDayValue = parseInt(document.getElementById('startDay').value);

    if (!numDaysInput || !timeRangeInput) {
        alert("Por favor, rellena el 'Número de días' y el 'Rango de hora'.");
        return;
    }

    const totalDays = evaluateMath(numDaysInput);
    const workDaysMatch = numDaysInput.match(/\d+/); 
    const workDays = workDaysMatch ? parseInt(workDaysMatch[0]) : totalDays;
    
    if (totalDays <= 0 || totalDays > 14) return alert("El número de días debe ser entre 1 y 14."); 

    const timeParts = timeRangeInput.split('-').map(t => t.trim());
    if (timeParts.length !== 2) return alert("Formato de hora incorrecto (HH:MM - HH:MM).");

    const startTimeMinutes = timeToMinutes(timeParts[0]);
    const endTimeMinutes = timeToMinutes(timeParts[1]);
    if (startTimeMinutes >= endTimeMinutes) return alert("La hora de inicio debe ser anterior a la de fin.");

    // 2. Extraer Actividades (AQUÍ ESTÁ LA MAGIA NUEVA: Recuperamos Inicio y Repetir)
    const activities = [];
    document.querySelectorAll('.activity-group').forEach(group => {
        const name = group.querySelector('.activity-name').value.trim();
        const durationInput = evaluateMath(group.querySelector('.activity-duration').value);
        const durationType = group.querySelector('.activity-duration-type').value;
        const frequency = evaluateMath(group.querySelector('.activity-frequency').value);
        
        if (name && durationInput > 0 && frequency > 0) {
            let durationPerSession = durationInput;
            if (durationType === 'total') {
                durationPerSession = Math.max(5, Math.floor(durationInput / frequency));
            }
            
            activities.push({
                name,
                duration: durationPerSession,
                frequency,
                startType: group.querySelector('.activity-start-type').value,
                startRef: group.querySelector('.activity-start-ref').value.trim(),
                repeatEnabled: group.querySelector('.activity-repeat-check').checked,
                repeatType: group.querySelector('.activity-repeat-type').value,
                repeatInterval: evaluateMath(group.querySelector('.activity-repeat-interval').value) || 1,
                placedCount: 0,
                placedSlots: [] // Guardamos en memoria dónde se puso para que otras dependan de esta
            });
        }
    });

    if (activities.length === 0) return alert("Por favor, agrega al menos una actividad válida.");

    // 3. Extraer Bloques
    const blocks = [];
    document.querySelectorAll('.block-group').forEach(group => {
        const day = parseInt(group.querySelector('.block-day').value); // 1 a 7
        const timeRange = group.querySelector('.block-time-range').value.trim();
        if (timeRange) {
            const blockTimes = timeRange.split('-').map(t => t.trim());
            blocks.push({ day, start: timeToMinutes(blockTimes[0]), end: timeToMinutes(blockTimes[1]) });
        }
    });

    // 4. Configurar Cuadrícula
    let intervalMinutes = gcdArray(activities.map(a => a.duration));
    intervalMinutes = Math.min(Math.max(intervalMinutes, 5), 60); // Limitar entre 5 y 60 min
    
    const totalSlots = Math.ceil((endTimeMinutes - startTimeMinutes) / intervalMinutes);
    const grid = Array.from({ length: totalDays }, () => Array(totalSlots).fill(null));

    // 5. Aplicar Bloques a la cuadrícula
    for (let dayCol = 0; dayCol < totalDays; dayCol++) {
        const currentWeekDay = ((startDayValue - 1) + dayCol) % 7 + 1; 
        for (let slot = 0; slot < totalSlots; slot++) {
            const slotStart = startTimeMinutes + (slot * intervalMinutes);
            const slotEnd = slotStart + intervalMinutes;
            
            const isBlocked = blocks.some(b => b.day === currentWeekDay && slotStart >= b.start && slotEnd <= b.end);
            if (isBlocked) grid[dayCol][slot] = "BLOQUEADO";
        }
    }

// 6. Algoritmo de Posicionamiento Inteligente (CORREGIDO)
    // Ordenamos: Las actividades dependientes ('después de') se posicionan al último.
    activities.sort((a, b) => {
        const aDep = (a.startType === 'after' || a.startType === 'mid') ? 1 : 0;
        const bDep = (b.startType === 'after' || b.startType === 'mid') ? 1 : 0;
        return aDep - bDep;
    });

    activities.forEach(activity => {
        const slotsNeeded = Math.ceil(activity.duration / intervalMinutes);
        
        // --- A. Resolver "Inicio" (Reglas de Dependencia) ---
        let minDayCol = 0;
        let minSlot = 0;
        
        if (activity.startType === 'day') {
            const dayNum = evaluateMath(activity.startRef);
            if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= totalDays) {
                minDayCol = dayNum - 1; // Ajustamos al índice base-0 (Ej: Día 3 es columna 2)
            }
        } else if (activity.startType === 'after' || activity.startType === 'mid') {
            const target = activities.find(a => a.name.toLowerCase() === activity.startRef.toLowerCase());
            if (target && target.placedSlots.length > 0) {
                const refIdx = activity.startType === 'after' 
                    ? target.placedSlots.length - 1  // Después de la ÚLTIMA sesión
                    : Math.floor(target.placedSlots.length / 2); // En MEDIO de la programación
                
                const refSlot = target.placedSlots[refIdx];
                minDayCol = refSlot.dayCol;
                minSlot = refSlot.endSlot; // Iniciar justo cuando acaba la otra
            }
        }

        // --- B. Resolver "Repetir" (Intervalos) ---
        let dayStep = 1;
        if (activity.repeatEnabled) {
            if (activity.repeatType === 'daily') dayStep = activity.repeatInterval;
            else if (activity.repeatType === 'weekly') dayStep = activity.repeatInterval * 7;
            else if (activity.repeatType === 'monthly') dayStep = activity.repeatInterval * 30; 
        } else {
            // Distribución automática equitativa en los días restantes disponibles
            const remainingDays = totalDays - minDayCol;
            if (activity.frequency > 1 && activity.frequency <= remainingDays) {
                dayStep = Math.floor(remainingDays / activity.frequency);
            } else if (activity.frequency > remainingDays) {
                dayStep = 0; // Permitir múltiples sesiones por día si la frecuencia es alta
            }
        }

        // --- C. Plantar sobre la Cuadrícula ---
        let currentDayCol = minDayCol;
        let attempts = 0;

        while (activity.placedCount < activity.frequency && attempts < 1000) {
            attempts++;
            
            // FIX: Si supera el total de días, regresa al día mínimo permitido (minDayCol), NO a 0
            if (currentDayCol >= totalDays) {
                currentDayCol = minDayCol; 
                // Mantenemos minSlot para la primera columna si regresa ahí
            }
            
            let startSearchingSlot = (currentDayCol === minDayCol) ? minSlot : 0;
            let placedThisRound = false;

            // Prevenir duplicados en un mismo día si hay suficientes días adelante
            const alreadyOnThisDay = grid[currentDayCol].includes(activity.name);
            if (alreadyOnThisDay && activity.frequency <= (totalDays - minDayCol) && dayStep > 0) {
                 currentDayCol++;
                 continue;
            }

            // Buscar espacio vertical en la columna actual
            for (let slot = startSearchingSlot; slot <= totalSlots - slotsNeeded; slot++) {
                let canFit = true;
                for (let s = 0; s < slotsNeeded; s++) {
                    if (grid[currentDayCol][slot + s] !== null) {
                        canFit = false; break;
                    }
                }

                // Si cabe, registramos la sesión
                if (canFit) {
                    for (let s = 0; s < slotsNeeded; s++) {
                        grid[currentDayCol][slot + s] = activity.name;
                    }
                    activity.placedSlots.push({ dayCol: currentDayCol, startSlot: slot, endSlot: slot + slotsNeeded });
                    activity.placedCount++;
                    placedThisRound = true;
                    break;
                }
            }

            // Avanzar según la estrategia establecida
            if (placedThisRound) {
                if (dayStep === 0) {
                    // Si se permiten varias por día, seguimos intentando en el mismo día (avanzando slots)
                    minSlot = activity.placedSlots[activity.placedSlots.length - 1].endSlot;
                } else {
                    currentDayCol += dayStep; 
                }
            } else {
                currentDayCol++; // Si no cupo en este día, saltamos al siguiente
            }
        }

        // --- D. Fallback de Fuerza Mayor (CORREGIDO) ---
        // Si el algoritmo estructurado no logró colocar todas las sesiones requeridas por falta de espacio,
        // busca cualquier hueco restante pero empezando estrictamente desde minDayCol en adelante.
        while (activity.placedCount < activity.frequency) {
            let forcedPlacement = false;
            for (let dayCol = minDayCol; dayCol < totalDays; dayCol++) {
                let startSlot = (dayCol === minDayCol) ? minSlot : 0;
                for (let slot = startSlot; slot <= totalSlots - slotsNeeded; slot++) {
                    let canFit = true;
                    for (let s = 0; s < slotsNeeded; s++) {
                        if (grid[dayCol][slot + s] !== null) { canFit = false; break; }
                    }
                    if (canFit) {
                        for (let s = 0; s < slotsNeeded; s++) grid[dayCol][slot + s] = activity.name;
                        activity.placedSlots.push({ dayCol, startSlot: slot, endSlot: slot + slotsNeeded });
                        activity.placedCount++;
                        forcedPlacement = true;
                        break;
                    }
                }
                if (forcedPlacement) break;
            }
            // Si ya no hay espacio matemático absoluto a partir de ese día, rompemos para evitar congelamiento
            if (!forcedPlacement) {
                console.warn(`No se pudieron agendar ${activity.frequency - activity.placedCount} sesiones para: ${activity.name} por restricciones de espacio.`);
                break;
            }
        }
    });

    // 7. Dibujar la Tabla en HTML
    const table = document.createElement('table');
    table.className = 'schedule-table';
    
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    headerRow.insertCell().textContent = 'Hora';
    
    for (let dayCol = 0; dayCol < totalDays; dayCol++) {
        const currentWeekDay = ((startDayValue - 1) + dayCol) % 7;
        const th = document.createElement('th');
        th.textContent = DAYS_OF_WEEK[currentWeekDay];
        if (dayCol >= workDays) th.classList.add('weekend-day');
        headerRow.appendChild(th);
    }

    const tbody = table.createTBody();
    for (let slot = 0; slot < totalSlots; slot++) {
        const row = tbody.insertRow();
        const slotStart = startTimeMinutes + (slot * intervalMinutes);
        const slotEnd = slotStart + intervalMinutes;
        
        const timeCell = row.insertCell();
        timeCell.textContent = `${minutesToTime(slotStart)} - ${minutesToTime(slotEnd)}`;
        timeCell.classList.add('time-label');

        for (let dayCol = 0; dayCol < totalDays; dayCol++) {
            const cell = row.insertCell();
            cell.classList.add('schedule-slot');
            if (dayCol >= workDays) cell.classList.add('weekend-slot');
            
            const content = grid[dayCol][slot];
            if (content === "BLOQUEADO") {
                cell.textContent = "Bloqueado";
                cell.classList.add('blocked-slot');
                cell.style.backgroundColor = "#ffcccc";
            } else if (content !== null) {
                cell.textContent = content;
                cell.classList.add('activity-slot');
                cell.style.backgroundColor = "#e0f7fa";
            }
        }
    }

    scheduleTable.appendChild(table);
    document.getElementById('exportBtn').classList.remove('hidden');
}

// --- CSV Export Function ---
function exportToCSV() {
    let csvData = [];
    const table = document.querySelector(".schedule-table");
    if (!table) return alert("Genera un horario primero.");

    const rows = table.querySelectorAll("tr");
    for (let i = 0; i < rows.length; i++) {
        let rowData = [];
        const cols = rows[i].querySelectorAll("td, th");
        for (let j = 0; j < cols.length; j++) {
            // Escape quotes by replacing double quotes with double-double quotes for CSV format
            let data = cols[j].innerText.replace(/"/g, '""');
            rowData.push('"' + data + '"');
        }
        csvData.push(rowData.join(","));
    }

    // Download Logic
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvData.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Mi_Horario.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Ensure at least one activity block exists when the page loads
document.addEventListener('DOMContentLoaded', () => {
    addActivity();
});
