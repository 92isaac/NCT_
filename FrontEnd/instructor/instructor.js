const authData = localStorage.getItem("authToken");
const Id = localStorage.getItem("uniqueId");
const useToken = JSON.parse(authData);
const uniqueId = JSON.parse(Id);
// console.log(useToken);
console.log(uniqueId?.uniqueId)

// Redirect based on userType
if (!useToken?.Token || !useToken.userType) {
  window.location.href = "index.html";
} else {
  // Redirect based on user type if necessary
  switch (useToken.userType) {
    case "Student":
      if (window.location.pathname !== "/FrontEnd/student.html") {
        window.location.href = "/FrontEnd/student.html";
      }
      break;
    case "Instructor":
      if (window.location.pathname !== "/FrontEnd/instructor.html") {
        window.location.href = "/FrontEnd/instructor.html";
      }
      break;
    case "Admin":
      if (window.location.pathname !== "/FrontEnd/adminDashboard.html") {
        window.location.href = "/FrontEnd/adminDashboard.html";
      }
      break;
    default:
      window.location.href = "index.html";
  }
}
   
const formatDate = (isoDateString) => {
  const date = new Date(isoDateString);
  let day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();

  // Function to get the ordinal suffix for a given day
  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const dayWithSuffix = `${day}${getOrdinalSuffix(day)}`;
  return ` ${dayWithSuffix} ${month} ${year}`;
};
   

const formatTo12Hour = (isoString) => {
  const date = new Date(isoString);

  let hours = date.getUTCHours();
  let minutes = date.getUTCMinutes();
  const isAM = hours < 12;

  // Convert to 12-hour format
  hours = hours % 12 || 12;

  // Format minutes to always be two digits
  let formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  // Combine the formatted time with AM/PM
  const ampm = isAM ? "am" : "pm";

  return `${hours}:${formattedMinutes}${ampm}`;
};
   
   
   
   // Fetch instructor data and display welcome message
   fetch('http://localhost:4000/api/instructor/profile', {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${useToken?.Token}`,
    },
  })
   .then(response => response.json())
   .then(data => {
    console.log(data);
        document.getElementById('firstName').textContent = data.FirstName;
        document.getElementById('middleName').textContent = data.title;
        document.getElementById('lastName').textContent = data.LastName;
        document.getElementById('education').textContent = data.Education;
        document.getElementById('email').textContent = data.Email;
        document.getElementById('phone').textContent = data.PhoneNumber;
        document.getElementById('hobby').textContent = data.Bio;
        localStorage.setItem("uniqueId", JSON.stringify({
          uniqueId: data.uniqueId
        }));

        // Display welcome message
        const welcomeMessage = `Hello ${data.FirstName} ${data.LastName}, Welcome to NCT Instructor portal`;
        document.getElementById('welcomeMessage').textContent = welcomeMessage;
    });

// Fetch and render class schedule with accept/decline buttons
fetch(`http://localhost:4000/api/admin/instructor-schedule/${uniqueId?.uniqueId}`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${useToken?.Token}`,
  },
})
   .then(response => response.json())
   .then(schedules => {
    console.log(schedules)
        const tableBody = document.querySelector('#scheduleTable tbody');
        schedules.forEach(schedule => {
            const row = tableBody.insertRow();
            row.insertCell(0).textContent = schedule.Course;
           row.insertCell(1).textContent = schedule.Campus;
           row.insertCell(2).textContent = schedule.RoomNumber;
           row.insertCell(3).textContent = formatDate(schedule.Date);
           row.insertCell(4).textContent = formatTo12Hour(schedule.StartTime);
           row.insertCell(5).textContent = formatTo12Hour(schedule.EndTime);
           row.insertCell(6).innerHTML = `<span class='status'>${schedule.Status}</span>`;
          //  row.insertCell(6).style.color = schedule.Status === "pending" ? "yellow" : "green";
            
            const actionCell = row.insertCell(7);
            const acceptBtn = document.createElement('button');
            acceptBtn.textContent = 'Accept';
            acceptBtn.className = 'btn btn-success btn-sm me-2';
            acceptBtn.onclick = () => handleAcceptSchedule(schedule.ScheduleId);

            const declineBtn = document.createElement('button');
            declineBtn.textContent = 'Decline';
            declineBtn.className = 'btn btn-danger btn-sm';
            declineBtn.onclick = () => handleRejectSchedule(schedule.ScheduleId);

            actionCell.appendChild(acceptBtn);
            actionCell.appendChild(declineBtn);
        });
        const status = document.querySelector('.status')
        if(status.textContent === "Pending"){
          status.style.color = "purple";
          status.style.fontWeight = '500'
        }else if(status.textContent === "Rejected"){
            status.style.color = "red";
          status.style.fontWeight = '700'
        }else{
          status.style.color = "green";
          status.style.fontWeight = '900'
        }
    });

// Handle schedule accept/decline action
function handleAcceptSchedule(ScheduleId) {
    fetch('http://localhost:4000/api/schedule/accept', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${useToken?.token}`,
        },
        body: JSON.stringify({ ScheduleId, 
          InstructorId:uniqueId.uniqueId }),
    })
   .then(response => response.json())
   .then(data => {
    console.log(data)
      if(data.success === true) {
        alert(`Schedule accepted successfully`);
        // Optionally, refresh the schedule table here
        window.location.reload();
      }else{
        alert(`Failed to accept schedule. Please try again.`);
      }
    })
   .catch(error => {
        console.error('Error:', error);
        alert(`Failed to accept schedule. Please try again.`);
    });
}
function handleRejectSchedule(ScheduleId) {
    fetch('http://localhost:4000/api/schedule/reject', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${useToken?.token}`,
        },
        body: JSON.stringify({ ScheduleId, 
          InstructorId:uniqueId.uniqueId }),
    })
   .then(response => response.json())
   .then(data => {
    console.log(data)
      if(data.success === true) {
        alert(`Schedule rejected successfully`);
        window.location.reload();
      }else{
        alert(`Failed to reject schedule. Please try again.`);

      }
    })
   .catch(error => {
        console.error('Error:', error);
        alert(`Failed to accept schedule. Please try again.`);
    });
}

// Search functionality for schedule
document.getElementById('scheduleSearch').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#scheduleTable tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
});

// Download schedule as Excel
document.getElementById('downloadSchedule').addEventListener('click', function() {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(document.getElementById('scheduleTable'));
    XLSX.utils.book_append_sheet(wb, ws, "Schedule");
    XLSX.writeFile(wb, "instructor_schedule.xlsx");
});

// Handle resume upload
document.getElementById('resumeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('resume', document.getElementById('resumeFile').files[0]);
    
    fetch('/api/upload-resume', {
        method: 'POST',
        body: formData
    })
   .then(response => response.json())
   .then(data => {
        alert('Resume uploaded successfully!');
    })
   .catch(error => {
        console.error('Error:', error);
        alert('Failed to upload resume. Please try again.');
    });
});

// Handle profile image upload
document.getElementById('profileImageUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profileImage').src = e.target.result;
        }
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('profileImage', file);
        
        fetch('/api/upload-profile-image', {
            method: 'POST',
            body: formData
        })
       .then(response => response.json())
       .then(data => {
            console.log('Profile image uploaded successfully');
        })
       .catch(error => {
            console.error('Error uploading profile image:', error);
        });
    }
});