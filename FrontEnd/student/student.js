const authData = localStorage.getItem("authToken");
const Id = localStorage.getItem("uniqueId");
const useToken = JSON.parse(authData);
const uniqueId = JSON.parse(Id);
// console.log(useToken);
console.log(uniqueId.uniqueId)

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




        // Fetch student data from the server
        fetch('http://localhost:4000/api/student/profile', {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${useToken?.Token}`,
          },
        })
            .then(response => response.json())
            .then(data => {
              console.log(data);
                document.getElementById('studentId').textContent = data.uniqueId.slice(0, 8);
                document.getElementById('firstName').textContent = data.FirstName;
                document.getElementById('middleName').textContent = data.CourseOfStudy;
                document.getElementById('lastName').textContent = data.LastName;
                document.getElementById('email').textContent = data.Email;
                document.getElementById('phone').textContent = data.PhoneNumber;
                // document.getElementById('hobby').textContent = data.hobby;
                localStorage.setItem("studId", JSON.stringify({
                  uniqueId: data.uniqueId
                }));
                const welcomeMessage = `Hello ${data.FirstName} ${data.LastName}, Welcome to NCT Student portal`;
                document.getElementById('welcomeMessage').textContent = welcomeMessage;
            });

            const getIRoom = async (roomid) => {
              const response = await fetch(
                `http://localhost:4000/api/room/single/${roomid}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${useToken?.token}`, // Fixed Authorization header
                  },
                }
              );
              const data = await response.json();
              console.log(data)
              if (data.status === 404) {
                return "Room not found";
              }
              // Return the instructor's name as a string
              return `${data.data[0].RoomNo}`;
            };

        // Fetch and render class schedule
        fetch('http://localhost:4000/api/schedule', {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${useToken?.Token}`,
          },
        })
            .then(response => response.json())
            .then(async (schedules) => {
              console.log(schedules)
                const tableBody = document.querySelector('#scheduleTable tbody');
                schedules?.data?.forEach(async schedule => {
                  const room = await getIRoom(schedule.RoomId)
                    const row = tableBody.insertRow();
                    row.insertCell(0).textContent = schedule.Course;
                    row.insertCell(1).textContent = formatDate(schedule.Date);
                    row.insertCell(2).textContent = formatTo12Hour(schedule.StartTime);
                    row.insertCell(3).textContent = formatTo12Hour(schedule.EndTime);
                    row.insertCell(4).textContent = room;
                });
            });

        // Fetch and render enrolled courses
        fetch('/api/enrolled-courses')
            .then(response => response.json())
            .then(courses => {
                const tableBody = document.querySelector('#coursesTable tbody');
                courses.forEach(course => {
                    const row = tableBody.insertRow();
                    row.insertCell(0).textContent = course.id;
                    row.insertCell(1).textContent = course.name;
                    row.insertCell(2).textContent = course.instructor;
                    row.insertCell(3).textContent = course.credits;
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

                // Here you would typically upload the file to your server
                const formData = new FormData();
                formData.append('profileImage', file);
                
                fetch(`http://localhost:4000/api/student/upload/${uniqueId.uniqueId}`, {
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