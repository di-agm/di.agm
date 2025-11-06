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

function addActivity() {
    activityCount++;
    const container = document.getElementById('activitiesContainer');
    const activityDiv = document.createElement('div');
    activityDiv.className = 'activity-group';
    activityDiv.id = `activity-${activityCount}`;

    activityDiv.innerHTML = `
        <h4>Actividad ${activityCount}</h4>
        <div class="form-group">
            <label>Nombre:</label>
            <input type="text" class="activity-name" placeholder="Ej: Clase de Matemáticas">
        </div>
        <div class="form-group">
            <label>Duración (min):</label>
            <input type="number" class="activity-duration" min="10" step="5" value="60">
        </div>
        <div class="form-group">
            <label>Veces por semana:</label>
            <input type="number" class="activity-frequency" min="1" value="3">
        </div>
        <button type="button" class="remove-btn" onclick="removeElement('activity-${activityCount}')">✖</button>
        <hr>
    `;
    container.appendChild(activityDiv);
}

function addBlock() {
    blockCount++;
    const container = document.getElementById('blocksContainer');
    const blockDiv = document.createElement('div');
    blockDiv.className = 'block-group';
    blockDiv.id = `block-${blockCount}`;

    blockDiv.innerHTML = `
        <h4>Bloque No Accesible ${blockCount}</h4>
        <div class="form-group">
            <label>Día:</label>
            <select class="block-day">
                ${DAYS_OF_WEEK.map((day, index) => `<option value="${index + 1}">${day}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>Rango de hora (HH:MM - HH:MM):</label>
            <input type="text" class="block-time-range" placeholder="Ej: 12:00 - 13:00">
        </div>
        <button type="button" class="remove-btn" onclick="removeElement('block-${blockCount}')">✖</button>
        <hr>
    `;
    container.appendChild(blockDiv);
}

function removeElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.remove();
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
        const duration = parseInt(group.querySelector('.activity-duration').value);
        const frequency = parseInt(group.querySelector('.activity-frequency').value);
        
        if (name && duration > 0 && frequency > 0) {
            activities.push({ name, duration, frequency });
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
    const intervalMinutes = 30; // Puedes ajustar el intervalo de tiempo

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
