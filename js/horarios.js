const DAYS_OF_WEEK = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

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

    // 1. Gather & Validate Base Inputs
    const numDaysInput = document.getElementById('numDays').value.trim();
    const timeRangeInput = document.getElementById('timeRange').value.trim();
    const startDayValue = parseInt(document.getElementById('startDay').value);

    if (!numDaysInput || !timeRangeInput) {
        alert("Por favor, rellena el 'Número de días' y el 'Rango de hora'.");
        return;
    }

    const parts = numDaysInput.split('+');
    const totalDays = parts.reduce((sum, part) => sum + parseInt(part.trim() || 0), 0);
    const workDays = parseInt(parts[0].trim() || 0);
    
    if (totalDays <= 0 || totalDays > 7) return alert("El número de días debe ser entre 1 y 7.");

    const timeParts = timeRangeInput.split('-').map(t => t.trim());
    if (timeParts.length !== 2) return alert("Formato de hora incorrecto (HH:MM - HH:MM).");

    const startTimeMinutes = timeToMinutes(timeParts[0]);
    const endTimeMinutes = timeToMinutes(timeParts[1]);
    if (startTimeMinutes >= endTimeMinutes) return alert("La hora de inicio debe ser anterior a la de fin.");

    // 2. Gather Activities
    const activities = [];
    document.querySelectorAll('.activity-group').forEach(group => {
        const name = group.querySelector('.activity-name').value.trim();
        const durationInput = parseInt(group.querySelector('.activity-duration').value);
        const durationType = group.querySelector('.activity-duration-type').value;
        const frequency = parseInt(group.querySelector('.activity-frequency').value);
        
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
                placedCount: 0
            });
        }
    });

    if (activities.length === 0) return alert("Por favor, agrega al menos una actividad válida.");

    // 3. Gather Blocks
    const blocks = [];
    document.querySelectorAll('.block-group').forEach(group => {
        const day = parseInt(group.querySelector('.block-day').value); // 1 to 7
        const timeRange = group.querySelector('.block-time-range').value.trim();
        if (timeRange) {
            const blockTimes = timeRange.split('-').map(t => t.trim());
            blocks.push({ day, start: timeToMinutes(blockTimes[0]), end: timeToMinutes(blockTimes[1]) });
        }
    });

    // 4. Grid Setup
    // Calculate smallest interval (e.g., 15 mins or 30 mins) based on activity lengths
    let intervalMinutes = gcdArray(activities.map(a => a.duration));
    intervalMinutes = Math.min(Math.max(intervalMinutes, 10), 60); // Clamp between 10m and 60m
    
    const totalSlots = Math.ceil((endTimeMinutes - startTimeMinutes) / intervalMinutes);
    const grid = Array.from({ length: totalDays }, () => Array(totalSlots).fill(null));

    // 5. Apply Blocks to Grid
    for (let dayCol = 0; dayCol < totalDays; dayCol++) {
        const currentWeekDay = ((startDayValue - 1) + dayCol) % 7 + 1; // 1=Lunes
        for (let slot = 0; slot < totalSlots; slot++) {
            const slotStart = startTimeMinutes + (slot * intervalMinutes);
            const slotEnd = slotStart + intervalMinutes;
            
            const isBlocked = blocks.some(b => b.day === currentWeekDay && slotStart >= b.start && slotEnd <= b.end);
            if (isBlocked) grid[dayCol][slot] = " ";
        }
    }

    // 6. Placement Algorithm (Smart Greed)
    activities.forEach(activity => {
        const slotsNeeded = Math.ceil(activity.duration / intervalMinutes);
        
        while (activity.placedCount < activity.frequency) {
            let placedThisRound = false;

            // Try to find a free column (day) to place the activity, spreading them out
            for (let dayCol = 0; dayCol < totalDays; dayCol++) {
                
                // Avoid scheduling same activity twice on the same day if possible
                if (grid[dayCol].includes(activity.name)) continue;

                // Search vertical slots on this day
                for (let slot = 0; slot <= totalSlots - slotsNeeded; slot++) {
                    let canFit = true;
                    
                    // Check if consecutive slots are free
                    for (let s = 0; s < slotsNeeded; s++) {
                        if (grid[dayCol][slot + s] !== null) {
                            canFit = false;
                            break;
                        }
                    }

                    if (canFit) {
                        for (let s = 0; s < slotsNeeded; s++) {
                            grid[dayCol][slot + s] = activity.name;
                        }
                        activity.placedCount++;
                        placedThisRound = true;
                        break; // Move to next required frequency placement
                    }
                }
                if (placedThisRound) break;
            }

            // Fallback: If it couldn't be placed cleanly (e.g., ran out of days without the activity)
            // Just force it into the first absolutely free space.
            if (!placedThisRound) {
                let forcedPlacement = false;
                for (let dayCol = 0; dayCol < totalDays; dayCol++) {
                    for (let slot = 0; slot <= totalSlots - slotsNeeded; slot++) {
                        let canFit = true;
                        for (let s = 0; s < slotsNeeded; s++) {
                            if (grid[dayCol][slot + s] !== null) { canFit = false; break; }
                        }
                        if (canFit) {
                            for (let s = 0; s < slotsNeeded; s++) grid[dayCol][slot + s] = activity.name;
                            activity.placedCount++;
                            forcedPlacement = true;
                            break;
                        }
                    }
                    if (forcedPlacement) break;
                }
                // If it STILL doesn't fit, there's mathematically no room left on the schedule.
                if (!forcedPlacement) break; 
            }
        }
    });

    // 7. Render Table from Grid
    const table = document.createElement('table');
    table.className = 'schedule-table';
    
    // Build Header
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

    // Build Body
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
