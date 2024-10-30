const token = localStorage.getItem("authToken");
const useToken = JSON.parse(token);
console.log(useToken);
// const instructorName = document.getElementById('instructorName')

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

if (!useToken?.Token) {
  window.location.href = "index.html";
}
console.log(useToken?.token);
let instructors;

document.addEventListener("DOMContentLoaded", () => {

  const deleteItemSchedule = async (itemId) => {
    const confirmed = window.confirm("Are you sure you want to delete this item?");
    
    if (confirmed) {
      try {
        const response = await fetch(`http://localhost:4000/api/admin/delete-schedule/${itemId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${useToken?.token}`,
          },
        });
    
        if (response.ok) {
          alert("Item deleted successfully");
          window.location.reload();  // Reload the page to update the table
        } else {
          const errorData = await response.json();
          console.error("Error:", errorData.message);
          alert("Failed to delete item: " + errorData.message);
        }
      } catch (error) {
        console.error("Network error:", error);
        alert("Failed to delete item due to a network error");
      }
    }
  };
  


  fetch("http://localhost:4000/api/admin/all-instructor", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorisation: `Bearer ${useToken?.token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      function renderTable(tableId) {
        const table = document.getElementById(tableId);
        const tbody = table.querySelector("tbody");
        tbody.innerHTML = "";
        data?.data?.forEach((item) => {
          const row = `
                  <tr>
    <th>${item.FirstName}</th>
    <th>${item.LastName}</th>
        <th>${item.Email}</th>
        <th>${item.PhoneNumber}</th>
    <th>${item.Department}</th>
    <th>${item.title}</th>
   
         <th> <button class="btn btn-sm btn-info" onclick="editItem('${tableId}', ${item.id})">Edit</button>          <button class="btn btn-sm btn-danger" onclick="deleteItem('${tableId}', ${item.id})">Delete</button>
</th>
</tr>
 `;

          tbody.innerHTML += row;
        });
      }
      renderTable("instructorTable");
    });

  fetch("http://localhost:4000/api/admin/all-student", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorisation: `Bearer ${useToken?.token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      function renderTable(tableId) {
        const table = document.getElementById(tableId);
        const tbody = table.querySelector("tbody");
        tbody.innerHTML = "";
        data?.data?.forEach((item) => {
          const row = `
                      <tr>
        <th>${item.FirstName}</th>
        <th>${item.LastName}</th>
            <th>${item.Email}</th>
            <th>${item.PhoneNumber}</th>
            <th>${item.CourseOfStudy}</th>
            <th>${item.level ? item.level : "Not Available"}</th>
       
             <th> <button class="btn btn-sm btn-info" onclick="editItem('${tableId}', ${item.id
            })">Edit</button>          <button class="btn btn-sm btn-danger" onclick="deleteItem('${tableId}', ${item.id
            })">Delete</button>
    </th>
    </tr>
     `;

          tbody.innerHTML += row;
        });
      }
      renderTable("studentTable");
    });

  const getInstructor = async (instructorId) => {
    const response = await fetch(
      `http://localhost:4000/api/admin/single-instructor/${instructorId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${useToken?.token}`, // Fixed Authorization header
        },
      }
    );
    const data = await response.json();

    // Return the instructor's name as a string
    return `${data.data[0].FirstName} ${data.data[0].LastName}`;
  };

  fetch("http://localhost:4000/api/admin/all-schedule", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${useToken?.token}`,
    },
  })
    .then((res) => res.json())
    .then(async (data) => {
      console.log(data);
      const table = document.getElementById("scheduleTable");
      const tbody = table.querySelector("tbody");
      tbody.innerHTML = "";

      // Loop through the schedules and render each row
      for (const item of data.data) {
        // Fetch the instructor's name asynchronously
        const instructorName = await getInstructor(item.InstructorId);

        // Generate the table row
        const row = `
          <tr>
            <th>${item.Course}</th>
            <th>${instructorName}</th>
            <th>${formatDate(item.Date)}</th>
            <th>${formatTo12Hour(item.StartTime)}</th>
            <th>${formatTo12Hour(item.EndTime)}</th>
            <th>${item.Campus ? item.Campus : "Not Available"}</th>
            <th>${item.Status}</th>
            <th>
              <button class="btn btn-sm btn-info" onclick="">Edit</button>
             <button class="btn btn-sm btn-danger" onClick="deleteItemSchedule('${item.uniqueId
          }')">Delete</button>    
            </th>
          </tr>
        `;

        // Append the row to the table body
        tbody.innerHTML += row;
      }
    });

  fetch("http://localhost:4000/api/admin/all-instructor", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${useToken?.token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      function renderInstructors() {
        const scheduleInstructor_container =
          document.getElementById("scheduleInstructor");
        scheduleInstructor_container.innerHTML = "";
        data?.data?.forEach((item) => {
          const row = `
 <option value="${item.uniqueId}">${item.FirstName} ${item.LastName}</option>
     `;
          scheduleInstructor_container.innerHTML += row;
        });
      }
      renderInstructors();
    });

  fetch("http://localhost:4000/api/admin/all-room", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorisation: `Bearer ${useToken?.token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      function renderRoom() {
        const scheduleInstructor_container =
          document.getElementById("campusRoom");
        scheduleInstructor_container.innerHTML = "";
        data?.data?.forEach((item) => {
          const row = `
 <option value="${item.uniqueId}">Room ${item.RoomNo}</option>
     `;
          scheduleInstructor_container.innerHTML += row;
        });
      }
      renderRoom();
    });
});

console.log(instructors);

// Sample data (replace with actual data from your backend)

let students = [];
let schedules = [];
let admissions = [];

function showModal(modalId) {
  const modal = new bootstrap.Modal(document.getElementById(modalId));
  modal.show();
}

function renderTable(tableId, data, columns) {
  const table = document.getElementById(tableId);
  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";
  data?.forEach((item) => {
    const row = document.createElement("tr");
    columns.forEach((column) => {
      const cell = document.createElement("td");
      console.log(column);
      console.log(item);
      cell.textContent = item[column];
      row.appendChild(cell);
    });
    const actionsCell = document.createElement("td");
    actionsCell.innerHTML = `
            <button class="btn btn-sm btn-info" onclick="editItem('${tableId}', ${item.id})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteItem('${tableId}', ${item.id})">Delete</button>
        `;
    row.appendChild(actionsCell);
    tbody.appendChild(row);
  });
}

function editItem(tableId, id) {
  // Implement edit functionality
  console.log(`Editing item ${id} in ${tableId}`);
}

function deleteItem(tableId, id) {
  // Implement delete functionality
  console.log(`Deleting item ${id} from ${tableId}`);
}

// Event listeners for form submissions
document
  .getElementById("instructorForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    try {
      let FirstName = document.querySelector("#instructorFirstName").value;
      let LastName = document.querySelector("#instructorLastName").value;
      let Email = document.querySelector("#instructorEmail").value;
      let PhoneNumber = document.querySelector("#instructorPhone").value;
      let Password = document.querySelector("#instructorPassword").value;
      let Education = document.querySelector("#instructorEducation").value;
      let Bio = document.querySelector("#instructorBio").value;
      let Department = document.querySelector("#instructorDepartment").value;
      let title = document.querySelector("#instructorTitle").value;

      const formData = {
        FirstName,
        LastName,
        Email,
        PhoneNumber,
        Password,
        Education,
        Bio,
        Department,
        title,
      };

      const response = fetch(
        "http://localhost:4000/api/admin/create-instructor",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorisation: `Bearer ${useToken?.token}`,
          },
          body: JSON.stringify(formData),
        }
      )
        .then((res) => res.json())
        .then((data) => {
          console.log(data);

          if (data.status !== 200) {
            alert("Failed to create user");
          } else {
            alert("user created successfully");
          }
          return data;
        });
    } catch (err) {
      console.log(err);
    }

    // Implement instructor form submission
  });

document.getElementById("studentForm").addEventListener("submit", function (e) {
  e.preventDefault();
  // Implement student form submission
});

// CREATE SCHDEDULE START FROM HERE

document
  .getElementById("scheduleForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    try {
      let InstructorId = document.querySelector("#scheduleInstructor").value;
      let RoomId = document.querySelector("#campusRoom").value;
      let Course = document.querySelector("#scheduleCourse").value;
      let Campus = document.querySelector("#campusRoom2").value;
      let Date = document.querySelector("#scheduleDate").value;
      let StartTime = document.querySelector("#scheduleStartTime").value;
      let EndTime = document.querySelector("#scheduleEndTime").value;

      const formData = {
        InstructorId,
        RoomId,
        Course,
        Campus,
        Date,
        StartTime,
        EndTime,
      };

      const response = fetch(
        "http://localhost:4000/api/admin/create-schedule",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorisation: `Bearer ${useToken?.token}`,
          },
          body: JSON.stringify(formData),
        }
      )
        .then((res) => res.json())
        .then((data) => {
          console.log(data);

          if (data.status !== 200) {
            alert("Failed to create schedule");
          } else {
            alert("Schedule created successfully");
          }
          return data;
        });
    } catch (err) {
      console.log(err);
    }
  });

document
  .getElementById("admissionForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    // Implement admission form submission
  });

// Initial render
renderTable("instructorTable", instructors, [
  "First Name",
  "Last Name",
  "Email",
  "Phone No",
  "Department",
]);
renderTable("studentTable", students, ["First Name", "Last Name", "course"]);
renderTable("scheduleTable", schedules, ["id", "course", "instructor", "time"]);
renderTable("admissionTable", admissions, [
  "id",
  "applicantName",
  "appliedCourse",
  "status",
]);
