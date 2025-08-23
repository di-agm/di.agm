let tasks = [];

function addTask() {
    const taskName = document.getElementById("task").value;
    const start = document.getElementById("startDate").value;
    const end = document.getElementById("endDate").value;

    if (!taskName || !start || !end) {
        alert("Por favor completa todos los campos");
        return;
    }

    tasks.push({ taskName, start, end });
    renderTable();
}

function renderTable() {
    const tbody = document.querySelector("#scheduleTable tbody");
    tbody.innerHTML = "";
    tasks.forEach(t => {
        const row = `<tr>
            <td>${t.taskName}</td>
            <td>${t.start}</td>
            <td>${t.end}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

function downloadCSV() {
    let csv = "Tarea,Fecha Inicio,Fecha Fin\n";
    tasks.forEach(t => {
        csv += `${t.taskName},${t.start},${t.end}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "cronograma.csv";
    link.click();
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Cronograma", 14, 15);

    let y = 25;
    doc.text("Tarea", 14, y);
    doc.text("Fecha Inicio", 70, y);
    doc.text("Fecha Fin", 140, y);
    y += 7;

    tasks.forEach(t => {
        doc.text(t.taskName, 14, y);
        doc.text(t.start, 70, y);
        doc.text(t.end, 140, y);
        y += 7;
    });

    doc.save("cronograma.pdf");
}
