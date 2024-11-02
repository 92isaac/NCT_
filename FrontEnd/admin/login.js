const form = document.getElementById("admin_login_form");
form.addEventListener("submit", async(e)=>{
    e.preventDefault()
    const email = document.getElementById("admin_email");
    const password = document.getElementById("adminPassword");
    console.log(email, password)

    try{
        const response = await fetch('http://localhost:4000/api/admin/sign-in', {
            method: "POST",
            headers:{
                "Content-Type" :"application/json"
            },
            body: JSON.stringify({
                Email: email.value,
                Password:password.value
            })
        })
        console.log(response)
        if(!response.ok){
            alert("Invalid credentials")
        }
        if(response.status === 200){
            const data = await response.json();
            console.log(data)
            localStorage.setItem("authToken", JSON.stringify(data))
            window.location.href = 'adminDashboard.html'
        }else{
            return null;
        }
    }catch(err){
        console.log(err)
    }
})



const intructorLogin = document.getElementById("intructorLogin");
intructorLogin.addEventListener("submit", async(e)=>{
    e.preventDefault()
    const email = document.getElementById("instructorEmail");
    const password = document.getElementById("instructor_Password");
    console.log(email, password)

    try{
        const response = await fetch('http://localhost:4000/api/instructor/sign-in', {
            method: "POST",
            headers:{
                "Content-Type" :"application/json"
            },
            body: JSON.stringify({
                Email: email.value,
                Password:password.value
            })
        })
        console.log(response)
        if(!response.ok){
            alert("Invalid credentials")
        }
        if(response.status === 200){
            const data = await response.json();
            console.log(data)
            // localStorage.setItem("authToken", JSON.stringify(data))
            localStorage.setItem("authToken", JSON.stringify({
                Token: data.Token,
                userType: data.userType,
            }));
            window.location.href = 'instructor.html'
        }else{
            return null;
        }
    }catch(err){
        console.log(err)
    }
})



const studentLogin = document.getElementById("studentLogin");
studentLogin.addEventListener("submit", async(e)=>{
    e.preventDefault()
    const email = document.getElementById("studentEmail");
    const password = document.getElementById("student_Password");
    console.log(email, password)

    try{
        const response = await fetch('http://localhost:4000/api/student/sign-in', {
            method: "POST",
            headers:{
                "Content-Type" :"application/json"
            },
            body: JSON.stringify({
                Email: email.value,
                Password:password.value
            })
        })
        console.log(response)
        if(!response.ok){
            alert("Invalid credentials")
        }
        if(response.status === 200){
            const data = await response.json();
            console.log(data)
            localStorage.setItem("authToken", JSON.stringify({
                Token: data.Token,
                userType: data.userType,
            }));
            window.location.href = 'student.html'
        }else{
            return null;
        }
    }catch(err){
        console.log(err)
    }
})