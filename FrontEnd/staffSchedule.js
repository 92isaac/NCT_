let calendar;
let events = [];
const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F06292', '#AED581', '#7986CB', '#9575CD', '#4DB6AC'];

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        editable: true,
        eventClick: function(info) {
            alert("Event clicked:\n" + info.event.title);
        },
        eventContent: function(arg) {
            return {
                html: `<div class="fc-event-main-frame" style="background-color: ${arg.event.backgroundColor}; color: white; padding: 2px; border-radius: 5px;">
                        <b>${arg.event.extendedProps.course}</b><br>${arg.event.extendedProps.instructor}<br>${arg.event.extendedProps.room}
                       </div>`
            };
        },
        dayCellDidMount: function(arg) {
            arg.el.style.backgroundColor = colors[arg.date.getDay()];
        }
    });
    calendar.render();
    renderTable();
});

document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        // Clear existing events
        events = [];
        calendar.removeAllEvents();

        // Add new events from the uploaded file
        json.forEach(item => {
            const event = {
                id: Date.now() + Math.random(),
                title: `${item.Course} - ${item.Instructor}`,
                start: `${item.Date}T${item.StartTime}`,
                end: `${item.Date}T${item.EndTime}`,
                backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                extendedProps: {
                    instructor: item.Instructor,
                    course: item.Course,
                    campus: item.Campus,
                    room: item.Room
                }
            };
            events.push(event);
            calendar.addEvent(event);
        });

        // Refresh the table view
        renderTable();
    };
    reader.readAsArrayBuffer(file);
});

function renderTable() {
    const tableBody = document.querySelector('#scheduleTable tbody');
    tableBody.innerHTML = '';
    events.forEach(event => {
        const row = `
            <tr>
                <td>${event.extendedProps.instructor}</td>
                <td>${event.extendedProps.course}</td>
                <td>${event.extendedProps.campus}</td>
                <td>${event.extendedProps.room}</td>
                <td>${event.start.split('T')[0]}</td>
                <td>${event.start.split('T')[1]}</td>
                <td>${event.end.split('T')[1]}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

function exportToExcel() {
    const ws = XLSX.utils.json_to_sheet(events.map(event => ({
        Instructor: event.extendedProps.instructor,
        Course: event.extendedProps.course,
        Campus: event.extendedProps.campus,
        Room: event.extendedProps.room,
        Date: event.start.split('T')[0],
        StartTime: event.start.split('T')[1],
        EndTime: event.end.split('T')[1]
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Schedules");
    
    XLSX.writeFile(wb, "course_schedules.xlsx");
}
