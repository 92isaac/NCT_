// const token = localStorage.getItem("authToken");
// const useToken = JSON.parse(token);
// console.log(useToken);
// const instructorName = document.getElementById('instructorName')
const authData = localStorage.getItem("authToken");
const Id = localStorage.getItem("uniqueId");
const useToken = JSON.parse(authData);
const uniqueId = JSON.parse(Id);
// console.log(useToken);
console.log(uniqueId?.uniqueId);
console.log(useToken);
let scheduleIdUpdate;

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

if (!useToken?.Token) {
  window.location.href = "index.html";
}
console.log(useToken?.Token);
let instructors;

document.addEventListener("DOMContentLoaded", () => {
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
       
             <th> <button class="btn btn-sm btn-info" onclick="editItem('${tableId}', ${
            item.id
          })">Edit</button>          <button class="btn btn-sm btn-danger" onclick="deleteItem('${tableId}', ${
            item.id
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
          Authorization: `Bearer ${useToken?.Token}`, // Fixed Authorization header
        },
      }
    );
    const data = await response.json();

    // Return the instructor's name as a string
    return `${data?.data[0].FirstName} ${data?.data[0].LastName}`;
  };

  fetch("http://localhost:4000/api/admin/all-schedule", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${useToken?.Token}`,
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
        const instructorName = await getInstructor(item?.InstructorId);

        // Generate the table row
        const row = `
          <tr>
            <th>${item.Course}</th>
            <th>${instructorName ? instructorName : "Not found"}</th>
            <th>${
              formatDate(item.Date) ? formatDate(item.Date) : "Not found"
            }</th>
            <th>${
              formatTo12Hour(item.StartTime)
                ? formatTo12Hour(item.StartTime)
                : "Not found"
            }</th>
            <th>${
              formatTo12Hour(item.EndTime)
                ? formatTo12Hour(item.EndTime)
                : "Not found"
            }</th>
            <th>${item.Campus ? item.Campus : "Not Available"}</th>
            <th>${item.Status}</th>
            <th>
              <button class="btn btn-sm btn-info" onclick="loadSchedule('${
                item.uniqueId
              }')">Edit</button>
              <button class="btn btn-sm btn-danger" onClick="deleteItemSchedule('${
                item.uniqueId
              }')">Delete</button>    
              </th>
              </tr>
              `;
        // <button class="btn btn-sm btn-info" id='editSchBtn' onclick="showModal('editScheduleModal')">Edit</button>

        // Append the row to the table body
        tbody.innerHTML += row;
      }
    });

  // `http://localhost:4000/api/admin/single-schedule/${}`
  // `http://localhost:4000/api/admin/update-schedule${}`

  fetch("http://localhost:4000/api/admin/all-instructor", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${useToken?.Token}`,
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

  fetch("http://localhost:4000/api/admin/all-instructor", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${useToken?.Token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      function renderInstructors() {
        const scheduleInstructor_container = document.getElementById(
          "editScheduleInstructor"
        );
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
      Authorisation: `Bearer ${useToken?.Token}`,
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

  fetch("http://localhost:4000/api/admin/all-room", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorisation: `Bearer ${useToken?.Token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      function renderRoom() {
        const scheduleInstructor_container =
          document.getElementById("editCampusRoom");
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

// Fetch a single schedule and populate the edit modal
async function loadSchedule(scheduleId) {
  try {
    console.log(scheduleId);
    scheduleIdUpdate = await scheduleId;
    const res = await fetch(
      `http://localhost:4000/api/admin/single-schedule/${scheduleId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${useToken?.Token}`,
        },
      }
    );

    const data = await res.json();
    console.log(data);
    if (!res.ok) throw new Error(data.error || "Failed to fetch schedule");

    // Populate modal fields with the fetched data
    // document.getElementById("editScheduleId").value = data.uniqueId;
    document.getElementById("editScheduleCourse").value = data.data[0].Course;
    document.getElementById("editScheduleInstructor").value =
      data.data[0].InstructorId;
    document.getElementById("editScheduleDate").value = data.data[0].Date;
    document.getElementById("editScheduleStartTime").value =
      data.data[0].StartTime;
    document.getElementById("editScheduleEndTime").value = data.data[0].EndTime;
    document.getElementById("editCampusRoom").value = data.data[0].RoomId;
    document.getElementById("editCampusRoom2").value = data.data[0].Campus;

    // Show the modal
    showModal("editScheduleModal");
  } catch (error) {
    console.error("Error fetching schedule:", error.message);
  }
}

// Submit the edited data
document
  .getElementById("editScheduleForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    // const scheduleId = document.getElementById("editScheduleId").value;
    const updatedData = {
      InstructorId: document.getElementById("editScheduleInstructor").value,
      RoomId: document.getElementById("editCampusRoom").value,
      Course: document.getElementById("editScheduleCourse").value,
      Campus: document.getElementById("editCampusRoom2").value,
      Date: document.getElementById("editScheduleDate").value,
      StartTime: document.getElementById("editScheduleStartTime").value,
      EndTime: document.getElementById("editScheduleEndTime").value,
    };

    try {
      const res = await fetch(
        `http://localhost:4000/api/admin/update-schedule/${scheduleIdUpdate}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${useToken?.Token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      const result = await res.json();
      if (!res.ok || res.status_code !== 200) {
        throw new Error(result.error || "Failed to update schedule");
      }

      if (res.status_code === 200) {
        // Successfully updated, refresh the schedule list
        alert("Schedule updated successfully");
        location.reload();
      }
    } catch (error) {
      console.error("Error updating schedule:", error.message);
    }
  });

const deleteItemSchedule = async (itemId) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this item?"
  );

  if (confirmed) {
    try {
      const response = await fetch(
        `http://localhost:4000/api/admin/delete-schedule/${itemId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${useToken?.Token}`,
          },
        }
      );

      if (response.ok) {
        alert("Item deleted successfully");
        window.location.reload();
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

// Sample data (replace with actual data from your backend)

let students = [];
let schedules = [];
let admissions = [];

// const editSchBtn = document.getElementById("editSchBtn");

// editSchBtn.addEventListener("click", function () {
//   const modal = new bootstrap.Modal(
//     document.getElementById("editScheduleModal")
//   );
//   modal.show();
// });

function showModal(modalId) {
  const modal = new bootstrap.Modal(document.getElementById(modalId));
  modal.show();
}

function downloadSchedule() {
  var table = document.getElementById("scheduleTable");
  var wb = XLSX.utils.table_to_book(table, { sheet: "Schedule" });
  XLSX.writeFile(wb, "class_schedule.xlsx");
}

// Search functionality for schedule
document
  .getElementById("scheduleSearch")
  .addEventListener("input", function (e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll("#scheduleTable tbody tr");

    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(searchTerm) ? "" : "none";
    });
  });

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

document
  .getElementById("scheduleUpload")
  .addEventListener("change", async function (event) {
    const file = event.target.files[0];
    console.log(file);

    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "http://localhost:4000/api/admin/upload-schedule",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${useToken?.token}`,
          },
          body: formData,
        }
      );
      console.log(response);

      if (response.ok) {
        const result = await response.json();
        alert(`Upload successful: ${result.error}`);
      } else {
        const error = await response.json();
        if (error) {
          const errorDiv = document.querySelector("#error-div");
          const ptag = document.createElement("p");
          ptag.innerHTML = error.error;
          ptag.className = "text-white text-xxl-center fw-bolder";
          errorDiv.append(ptag);
          errorDiv.style.backgroundColor = "red";
        }
        alert(`Upload failed: ${error.error}`);
      }
    } catch (error) {
      alert(`An error occurred: ${error.error}`);
    }
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
