// ==========================================
// EMPLOYEE DATA
// ==========================================

let employees = [];


// ==========================================
// LOAD EMPLOYEES
// ==========================================

async function loadEmployees() {

    // First check localStorage
    const savedEmployees = localStorage.getItem("employees");

    if (savedEmployees) {

        employees = JSON.parse(savedEmployees);

    } else {

        // If localStorage is empty, load from JSON
        try {

            const response = await fetch("employees.json");

            if (!response.ok) {
                throw new Error("Could not load employees.json");
            }

            employees = await response.json();

            saveEmployees();

        } catch (error) {

            console.error(error);
            alert("Unable to load employee data.");

        }
    }
}


// ==========================================
// SAVE EMPLOYEES TO LOCAL STORAGE
// ==========================================

function saveEmployees() {

    localStorage.setItem(
        "employees",
        JSON.stringify(employees)
    );
}


// ==========================================
// LOGIN
// ==========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const username =
            document.getElementById("username").value.trim();

        const password =
            document.getElementById("password").value.trim();

        const message =
            document.getElementById("message");


        // ADMIN LOGIN
        if (username === "admin" && password === "admin123") {

            localStorage.setItem("role", "admin");

            window.location.href = "admin.html";

            return;
        }


        // LOAD EMPLOYEES
        await loadEmployees();


        // EMPLOYEE LOGIN
        const employee = employees.find(function(emp) {

            return emp.id === username &&
                   emp.password === password;

        });


        if (employee) {

            localStorage.setItem("role", "employee");

            localStorage.setItem(
                "employeeId",
                employee.id
            );

            window.location.href = "employee.html";

        } else {

            message.textContent =
                "Invalid username or password.";

        }

    });
}


// ==========================================
// EMPLOYEE PAGE
// ==========================================

if (window.location.pathname.includes("employee.html")) {

    loadEmployees().then(function() {

        const role = localStorage.getItem("role");

        const employeeId =
            localStorage.getItem("employeeId");


        // Check login
        if (role !== "employee" || !employeeId) {

            window.location.href = "login.html";

            return;
        }


        // Find employee
        const employee = employees.find(function(emp) {

            return emp.id === employeeId;

        });


        if (!employee) {

            alert("Employee not found.");

            logout();

            return;
        }


        // Display employee information
        document.getElementById("employeeName").textContent =
            employee.name;

        document.getElementById("employeeDesignation").textContent =
            employee.designation;

        document.getElementById("employeeId").textContent =
            employee.id;

        document.getElementById("name").textContent =
            employee.name;

        document.getElementById("department").textContent =
            employee.department;

        document.getElementById("designation").textContent =
            employee.designation;

        document.getElementById("email").textContent =
            employee.email;


        // Profile initial
        document.getElementById("profileInitial").textContent =
            employee.name.charAt(0).toUpperCase();

    });
}


// ==========================================
// ADMIN PAGE
// ==========================================

if (window.location.pathname.includes("admin.html")) {

    loadEmployees().then(function() {

        const role = localStorage.getItem("role");


        // Only admin can enter
        if (role !== "admin") {

            window.location.href = "login.html";

            return;
        }


        displayEmployees();

    });
}


// ==========================================
// DISPLAY EMPLOYEES
// ==========================================

function displayEmployees() {

    const table =
        document.getElementById("employeeTable");


    if (!table) return;


    table.innerHTML = "";


    employees.forEach(function(employee, index) {

        const row = document.createElement("tr");


        row.innerHTML = `

            <td>
                ${employee.id}
            </td>


            <!-- NAME -->
            <td>

                <div id="name-${index}">
                    ${employee.name}
                </div>

                <div id="name-edit-${index}" class="edit-area">
                </div>

            </td>


            <!-- DEPARTMENT -->
            <td>

                <div id="department-${index}">
                    ${employee.department}
                </div>

                <div id="department-edit-${index}" class="edit-area">
                </div>

            </td>


            <!-- DESIGNATION -->
            <td>

                <div id="designation-${index}">
                    ${employee.designation}
                </div>

                <div id="designation-edit-${index}" class="edit-area">
                </div>

            </td>


            <!-- EMAIL -->
            <td>

                <div id="email-${index}">
                    ${employee.email}
                </div>

                <div id="email-edit-${index}" class="edit-area">
                </div>

            </td>


            <!-- ACTIONS -->
            <td>

                <button
                    class="edit-btn"
                    onclick="editField(${index}, 'name')">
                    Edit Name
                </button>

                <button
                    class="edit-btn"
                    onclick="editField(${index}, 'department')">
                    Edit Department
                </button>

                <button
                    class="edit-btn"
                    onclick="editField(${index}, 'designation')">
                    Edit Designation
                </button>

                <button
                    class="edit-btn"
                    onclick="editField(${index}, 'email')">
                    Edit Email
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteEmployee(${index})">
                    Delete
                </button>

            </td>

        `;


        table.appendChild(row);

    });

}


// ==========================================
// EDIT ONLY ONE FIELD
// ==========================================

function editField(index, field) {

    const value = employees[index][field];


    const display =
        document.getElementById(
            `${field}-${index}`
        );


    const editArea =
        document.getElementById(
            `${field}-edit-${index}`
        );


    // Prevent multiple editing
    if (editArea.innerHTML !== "") {
        return;
    }


    // Hide original value
    display.style.display = "none";


    // Create input
    editArea.innerHTML = `

        <input
            type="text"
            id="input-${field}-${index}"
            value="${value}"
        >

        <button
            class="save-btn"
            onclick="saveField(${index}, '${field}')">
            Save
        </button>

        <button
            class="cancel-btn"
            onclick="cancelEdit(${index}, '${field}')">
            Cancel
        </button>

    `;

}


// ==========================================
// SAVE ONE FIELD
// ==========================================

function saveField(index, field) {

    const input =
        document.getElementById(
            `input-${field}-${index}`
        );


    const newValue = input.value.trim();


    // Don't allow empty values
    if (newValue === "") {

        alert("This field cannot be empty.");

        return;
    }


    // Update only selected field
    employees[index][field] = newValue;


    // Save to localStorage
    saveEmployees();


    // Refresh table
    displayEmployees();


    alert(
        `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`
    );

}


// ==========================================
// CANCEL EDIT
// ==========================================

function cancelEdit(index, field) {

    displayEmployees();

}


// ==========================================
// ADD EMPLOYEE
// ==========================================

function addEmployee() {

    const id =
        prompt("Enter Employee ID:");

    if (!id) return;


    // Check duplicate ID
    const existing =
        employees.find(function(emp) {

            return emp.id === id;

        });


    if (existing) {

        alert("Employee ID already exists.");

        return;
    }


    const password =
        prompt("Enter Password:");

    if (!password) return;


    const name =
        prompt("Enter Name:");

    if (!name) return;


    const department =
        prompt("Enter Department:");

    if (!department) return;


    const designation =
        prompt("Enter Designation:");

    if (!designation) return;


    const email =
        prompt("Enter Email:");

    if (!email) return;


    // Create employee
    const newEmployee = {

        id: id,

        password: password,

        name: name,

        department: department,

        designation: designation,

        email: email

    };


    // Add employee
    employees.push(newEmployee);


    // Save
    saveEmployees();


    // Refresh table
    displayEmployees();


    alert("Employee added successfully!");

}


// ==========================================
// DELETE EMPLOYEE
// ==========================================

function deleteEmployee(index) {

    const employee =
        employees[index];


    const confirmation =
        confirm(
            `Are you sure you want to delete ${employee.name}?`
        );


    if (!confirmation) return;


    employees.splice(index, 1);


    saveEmployees();


    displayEmployees();


    alert("Employee deleted successfully!");

}


// ==========================================
// LOGOUT
// ==========================================

function logout() {

    localStorage.removeItem("role");

    localStorage.removeItem("employeeId");


    window.location.href = "index.html";

}