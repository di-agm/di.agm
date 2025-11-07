const DAYS_OF_WEEK = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

let activityCount = 0;
let blockCount = 0;

function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function gcdArray(numbers) {
    return numbers.reduce((acc, n) => gcd(acc, n));
}

function addActivity() {
    activityCount++;
    const container = document.getElementById('activitiesContainer');
    const template = document.getElementById('activity-template');
    const clone = template.content.cloneNode(true);
    const activityDiv = clone.querySelector('.activity-group');
    const activityId = `activity-${activityCount}`;
    activityDiv.id = activityId;
    activityDiv.addEventListener('dragstart', handleDragStart);
    activityDiv.addEventListener('dragover', handleDragOver);
    activityDiv.addEventListener('drop', handleDrop);
    activityDiv.querySelector('h4').textContent = `Actividad ${activityCount}`;
    activityDiv.querySelector('.remove-btn').onclick = () => removeElement(activityId);
    activityDiv.querySelector('.move-btn[data-action="up"]').onclick = () => moveActivity('up', activityId);
    activityDiv.querySelector('.move-btn[data-action="down"]').onclick = () => moveActivity('down', activityId);
    
    const repeatCheck = activityDiv.querySelector('.activity-repeat-check');
    repeatCheck.addEventListener('change', () => {
        const typeSelect = activityDiv.querySelector('.activity-repeat-type');
        const intervalInput = activityDiv.querySelector('.activity-repeat-interval');
        const enabled = repeatCheck.checked;
        typeSelect.disabled = !enabled;
        intervalInput.disabled = !enabled;
    });
    container.appendChild(clone);
}

function addBlock() {
    blockCount++;
    const container = document.getElementById('blocksContainer');
    const template = document.getElementById('block-template');
    const clone = template.content.cloneNode(true);
    const blockDiv = clone.querySelector('.block-group');
    const blockId = `block-${blockCount}`;
    blockDiv.id = blockId;
    blockDiv.querySelector('h4').textContent = `Bloque No Accesible ${blockCount}`;
    blockDiv.querySelector('.remove-btn').onclick = () => removeElement(blockId);
    
    const daySelect = blockDiv.querySelector('.block-day');
    DAYS_OF_WEEK.forEach((day, index) => {
        const option = document.createElement('option');
        option.value = index + 1; // Assuming 1=Lunes, 7=Domingo
        option.textContent = day;
        daySelect.appendChild(option);
    });
    
    container.appendChild(clone);
}

function removeElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.remove();
    }
}

let draggedElement = null;

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
    const next = siblings.find(sibling => {
        return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
    });
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
    } 
    else if (direction === 'down' && element.nextElementSibling) {
        container.insertBefore(element.nextElementSibling, element);
    }
}

function generateSchedule() {
    const scheduleTable = document.getElementById('scheduleTable');
    scheduleTable.innerHTML = ''; 
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
    
    if (totalDays <= 0 || totalDays > 7) {
        alert("El número total de días debe ser entre 1 y 7.");
        return;
    }

    const timeParts = timeRangeInput.split('-').map(t => t.trim());
    if (timeParts.length !== 2) {
        alert("El 'Rango de hora' debe tener el formato HH:MM - HH:MM.");
        return;
    }

    const startTimeMinutes = timeToMinutes(timeParts[0]);
    const endTimeMinutes = timeToMinutes(timeParts[1]);

    if (startTimeMinutes >= endTimeMinutes) {
        alert("La hora de inicio debe ser anterior a la hora de fin.");
        return;
    }

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
        
            const repeatEnabled = group.querySelector('.activity-repeat-check').checked;
            const repeatType = group.querySelector('.activity-repeat-type').value;
            const repeatInterval = parseInt(group.querySelector('.activity-repeat-interval').value) || 1;
        
            activities.push({
                name,
                duration: durationPerSession,
                frequency,
                durationType,
                repeatEnabled,
                repeatType,
                repeatInterval,
            });
        }
    });

    if (activities.length === 0) {
         alert("Por favor, agrega al menos una actividad.");
         return;
    }

    const blocks = [];
    document.querySelectorAll('.block-group').forEach(group => {
        const day = parseInt(group.querySelector('.block-day').value);
        const timeRange = group.querySelector('.block-time-range').value.trim();
        
        if (timeRange) {
            const blockTimes = timeRange.split('-').map(t => t.trim());
            const start = timeToMinutes(blockTimes[0]);
            const end = timeToMinutes(blockTimes[1]);

            if (start < end) {
                blocks.push({ day, start, end });
            }
        }
    });

    const table = document.createElement('table');
    table.className = 'schedule-table';
  
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    headerRow.insertCell().textContent = 'Hora';
  
    for (let i = 0; i < totalDays; i++) {
        const dayIndex = (startDayValue - 1 + i) % 7;
        const dayName = DAYS_OF_WEEK[dayIndex];
        
        const th = document.createElement('th');
        th.textContent = dayName;
        
        if (i >= workDays) {
            th.classList.add('weekend-day');
        }

        headerRow.appendChild(th);
    }

    const tbody = table.createTBody();
    let intervalMinutes = 30; // valor por defecto
    if (activities.length > 0) {
        const durations = activities.map(a => a.duration);
        intervalMinutes = gcdArray(durations);
        if (intervalMinutes < 5) intervalMinutes = 5; // límite de seguridad
    }
    
    for (let current = startTimeMinutes; current < endTimeMinutes; current += intervalMinutes) {
        const row = tbody.insertRow();
        
        const timeCell = row.insertCell();
        timeCell.textContent = `${minutesToTime(current)} - ${minutesToTime(current + intervalMinutes)}`;
        timeCell.classList.add('time-label');

        for (let i = 0; i < totalDays; i++) {
            const cell = row.insertCell();
            cell.classList.add('schedule-slot');

             if (i >= workDays) {
                cell.classList.add('weekend-slot');
            }
            const dayToCheck = (startDayValue + i); // El día de la semana (1-7)
            const isBlocked = blocks.some(block => 
                block.day === dayToCheck && current >= block.start && (current + intervalMinutes) <= block.end
            );
            
            if (isBlocked) {
                cell.textContent = 'Bloqueado';
                cell.classList.add('blocked-slot');
            }

        }
    }

let currentDay = 0;
let currentTime = startTimeMinutes;

for (const activity of activities) {
    let startDay = 0;
    let startMinute = startTimeMinutes;

    if (activity.startType === "day") {
        const dayNum = parseInt(activity.startRef);
        if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= totalDays) {
            startDay = dayNum - 1;
        }
    } 
    else if (activity.startType === "after" || activity.startType === "mid") {
        const target = activities.find(a =>
            a.name.toLowerCase() === activity.startRef.toLowerCase()
        );
        if (target && target._placedSlots && target._placedSlots.length > 0) {
            const refSlot = activity.startType === "after"
                ? target._placedSlots[target._placedSlots.length - 1]
                : target._placedSlots[Math.floor(target._placedSlots.length / 2)];
            
            startDay = refSlot.day;
            startMinute = refSlot.end;
        }
    }
    activity._placedSlots = [];
    const slotsNeeded = Math.ceil(activity.duration / intervalMinutes);
    let placed = 0;
    let attempts = 0;

    while (placed < activity.frequency && attempts < 200) {
        attempts++;

        const dayIndex = (startDayValue - 1 + currentDay) % 7;
        const dayNumber = currentDay + 1;

        let rowIndex = Math.floor((currentTime - startTimeMinutes) / intervalMinutes);
        let foundSlot = false;

        while (rowIndex + slotsNeeded <= tbody.rows.length) {
            let conflict = false;

            for (let s = 0; s < slotsNeeded; s++) {
                const row = tbody.rows[rowIndex + s];
                const cell = row.cells[dayNumber]; // columna de día (0 es la hora)
                if (
                    cell.classList.contains('blocked-slot') ||
                    cell.textContent.trim() !== ''
                ) {
                    conflict = true;
                    break;
                }
            }

            if (!conflict) {
                for (let s = 0; s < slotsNeeded; s++) {
                    const row = tbody.rows[rowIndex + s];
                    const cell = row.cells[dayNumber];
                    cell.textContent = activity.name;
                    cell.classList.add('activity-slot');
                    activity._placedSlots.push({
                        day: currentDay,
                        start: currentTime,
                        end: currentTime + activity.duration
                    });
                }
                placed++;
                foundSlot = true;
                break;
            }

            rowIndex++;
        }

        currentDay = (currentDay + 1) % totalDays;
        if (!foundSlot) currentTime += intervalMinutes;
        if (currentTime >= endTimeMinutes) currentTime = startTimeMinutes;
    }
}

    scheduleTable.appendChild(table);
    document.getElementById('exportBtn').classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    addActivity();
});
