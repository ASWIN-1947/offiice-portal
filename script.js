// ==========================================
// OFFICE PORTAL - SCRIPT.JS
// ==========================================

// Employee data
let employees = [];

// Login users (Admin + Manager)
let users = [];

// ==========================================
// SESSION SECURITY
// ==========================================

const currentPage = window.location.pathname.split("/").pop();

const protectedPages = [
    "admin.html",
    "manager.html",
    "employee.html"
];

// Check protected pages
if (protectedPages.includes(currentPage)) {

    const role = sessionStorage.getItem("role");

    if (!role) {
        window.location.replace("index.html?expired=true");
    }
}

// Detect browser Back / Forward
window.addEventListener("pageshow", function (event) {

    if (!protectedPages.includes(currentPage)) {
        return;
    }

    const navigation = performance.getEntriesByType("navigation")[0];

    if (
        event.persisted ||
        (navigation && navigation.type === "back_forward")
    ) {
        sessionStorage.removeItem("role");
        sessionStorage.removeItem("employeeId");

        window.location.replace("index.html?expired=true");
    }

});


// ==========================================
// LOAD DATA FROM employees.json
// ==========================================

async function loadData() {

    try {

        // Always load JSON so Admin and Manager
        // credentials come from employees.json
        const response = await fetch("employees.json");

        if (!response.ok) {
            throw new Error("Could not load employees.json");
        }

        const data = await response.json();

        // ------------------------------
        // NEW JSON STRUCTURE
        // ------------------------------

        if (!Array.isArray(data)) {

            users = Array.isArray(data.users)
                ? data.users
                : [];

            const jsonEmployees = Array.isArray(data.employees)
                ? data.employees
                : [];

            // Check if Admin has already edited employee data
            // and saved it in localStorage
            const savedEmployees =
                sessionStorage.getItem("employees");

            if (savedEmployees) {

                try {

                    const parsedEmployees =
                        JSON.parse(savedEmployees);

                    if (Array.isArray(parsedEmployees)) {
                        employees = parsedEmployees;
                    } else {
                        employees = jsonEmployees;
                    }

                } catch (error) {

                    console.error(
                        "Invalid localStorage employee data:",
                        error
                    );

                    employees = jsonEmployees;
                }

            } else {

                employees = jsonEmployees;

                // Save initial employee data
                // so Admin changes can persist
                saveEmployees();
            }

            return;
        }


        // ==========================================
        // OLD ARRAY FORMAT SUPPORT
        // ==========================================
        // This prevents the website from breaking
        // if the old JSON format is still present.

        users = data.filter(function(item) {

            return item.username &&
                   item.password &&
                   item.role;

        });


        const jsonEmployees =
            data.filter(function(item) {

                return item.id &&
                       item.name;

            });


        const savedEmployees =
            sessionStorage.getItem("employees");


        if (savedEmployees) {

            try {

                const parsedEmployees =
                    JSON.parse(savedEmployees);

                if (Array.isArray(parsedEmployees)) {

                    employees = parsedEmployees;

                } else {

                    employees = jsonEmployees;

                }

            } catch (error) {

                employees = jsonEmployees;

            }

        } else {

            employees = jsonEmployees;

            saveEmployees();

        }

    } catch (error) {

        console.error(
            "Error loading employees.json:",
            error
        );

        alert(
            "Unable to load employee data. Please check employees.json."
        );

    }
}


// ==========================================
// SAVE EMPLOYEES TO LOCAL STORAGE
// ==========================================

function saveEmployees() {

    sessionStorage.setItem(
        "employees",
        JSON.stringify(employees)
    );

}


// ==========================================
// LOGIN
// ==========================================

// ==========================================
// SESSION EXPIRED MESSAGE
// ==========================================

if (window.location.pathname.endsWith("index.html") ||
    window.location.pathname.endsWith("/")) {

    const params = new URLSearchParams(window.location.search);

    if (params.get("expired") === "true") {

        window.addEventListener("DOMContentLoaded", function () {

            const message =
                document.getElementById("message");

            if (message) {
                message.textContent =
                    "Session expired. Please login again.";
            }

        });

    }
}

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const username =
                document.getElementById(
                    "username"
                ).value.trim();


            const password =
                document.getElementById(
                    "password"
                ).value.trim();


            const message =
                document.getElementById(
                    "message"
                );


            // Clear old message
            if (message) {
                message.textContent = "";
            }


            // ==========================================
            // LOAD JSON
            // ==========================================

            await loadData();


            // ==========================================
            // ADMIN / MANAGER LOGIN
            // ==========================================

            const user =
                users.find(function(account) {

                    return (
                        account.username === username &&
                        account.password === password
                    );

                });


            if (user) {

                // Save role
                sessionStorage.setItem(
                    "role",
                    user.role
                );


                // Remove old employee login
                sessionStorage.removeItem(
                    "employeeId"
                );


                // ------------------------------
                // ADMIN
                // ------------------------------

                if (user.role === "admin") {

                    window.location.replace("admin.html");

                    return;
                }


                // ------------------------------
                // MANAGER
                // ------------------------------

                if (user.role === "manager") {

                    window.location.replace("manager.html");

                    return;
                }

            }


            // ==========================================
            // EMPLOYEE LOGIN
            // ==========================================

            const employee =
                employees.find(function(emp) {

                    return (
                        emp.id === username &&
                        emp.password === password
                    );

                });


            if (employee) {

                sessionStorage.setItem(
                    "role",
                    "employee"
                );


                sessionStorage.setItem(
                    "employeeId",
                    employee.id
                );


                window.location.replace("employee.html");


                return;
            }


            // ==========================================
            // INVALID LOGIN
            // ==========================================

            if (message) {

                message.textContent =
                    "Invalid username or password.";

            }

        }
    );

}


// ==========================================
// EMPLOYEE PAGE
// ==========================================

if (
    window.location.pathname.includes(
        "employee.html"
    )
) {

    loadData().then(function() {

        const role =
            sessionStorage.getItem("role");


        const employeeId =
            sessionStorage.getItem(
                "employeeId"
            );


        // ==========================================
        // CHECK LOGIN
        // ==========================================

        if (
            role !== "employee" ||
            !employeeId
        ) {

            window.location.replace("index.html?expired=true");

            return;
        }


        // ==========================================
        // FIND EMPLOYEE
        // ==========================================

        const employee =
            employees.find(function(emp) {

                return emp.id === employeeId;

            });


        if (!employee) {

            alert(
                "Employee not found."
            );

            logout();

            return;
        }


        // ==========================================
        // DISPLAY EMPLOYEE INFORMATION
        // ==========================================

        const employeeName =
            document.getElementById(
                "employeeName"
            );

        const employeeDesignation =
            document.getElementById(
                "employeeDesignation"
            );

        const profileInitial =
            document.getElementById(
                "profileInitial"
            );

        const employeeIdElement =
            document.getElementById(
                "employeeId"
            );

        const name =
            document.getElementById(
                "name"
            );

        const department =
            document.getElementById(
                "department"
            );

        const designation =
            document.getElementById(
                "designation"
            );

        const email =
            document.getElementById(
                "email"
            );


        if (employeeName) {

            employeeName.textContent =
                employee.name;

        }


        if (employeeDesignation) {

            employeeDesignation.textContent =
                employee.designation;

        }


        if (profileInitial) {

            profileInitial.textContent =
                employee.name
                    .charAt(0)
                    .toUpperCase();

        }


        if (employeeIdElement) {

            employeeIdElement.textContent =
                employee.id;

        }


        if (name) {

            name.textContent =
                employee.name;

        }


        if (department) {

            department.textContent =
                employee.department;

        }


        if (designation) {

            designation.textContent =
                employee.designation;

        }


        if (email) {

            email.textContent =
                employee.email;

        }

    });

}


// ==========================================
// ADMIN PAGE
// ==========================================

if (
    window.location.pathname.includes(
        "admin.html"
    )
) {

    loadData().then(function() {

        const role =
            sessionStorage.getItem(
                "role"
            );


        // Only Admin can access
        if (role !== "admin") {

            window.location.replace("index.html?expired=true");
            return;
        }


        displayEmployees();

    });

}


// ==========================================
// DISPLAY EMPLOYEES FOR ADMIN
// ==========================================

function displayEmployees() {

    const table =
        document.getElementById(
            "employeeTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = "";


    employees.forEach(
        function(employee, index) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHTML(employee.id)}
                </td>


                <td>

                    <div id="name-${index}">
                        ${escapeHTML(employee.name)}
                    </div>

                    <div
                        id="name-edit-${index}"
                        class="edit-area">
                    </div>

                </td>


                <td>

                    <div id="department-${index}">
                        ${escapeHTML(employee.department)}
                    </div>

                    <div
                        id="department-edit-${index}"
                        class="edit-area">
                    </div>

                </td>


                <td>

                    <div id="designation-${index}">
                        ${escapeHTML(employee.designation)}
                    </div>

                    <div
                        id="designation-edit-${index}"
                        class="edit-area">
                    </div>

                </td>


                <td>

                    <div id="email-${index}">
                        ${escapeHTML(employee.email)}
                    </div>

                    <div
                        id="email-edit-${index}"
                        class="edit-area">
                    </div>

                </td>


                <td>

                    <button
                        class="edit-btn"
                        onclick="editField(
                            ${index},
                            'name'
                        )">

                        Edit Name

                    </button>


                    <button
                        class="edit-btn"
                        onclick="editField(
                            ${index},
                            'department'
                        )">

                        Edit Department

                    </button>


                    <button
                        class="edit-btn"
                        onclick="editField(
                            ${index},
                            'designation'
                        )">

                        Edit Designation

                    </button>


                    <button
                        class="edit-btn"
                        onclick="editField(
                            ${index},
                            'email'
                        )">

                        Edit Email

                    </button>


                    <button
                        class="delete-btn"
                        onclick="deleteEmployee(
                            ${index}
                        )">

                        Delete

                    </button>

                </td>

            `;


            table.appendChild(row);

        }
    );

}


// ==========================================
// EDIT ONE FIELD
// ==========================================

function editField(index, field) {

    const employee =
        employees[index];


    if (!employee) {
        return;
    }


    const value =
        employee[field];


    const display =
        document.getElementById(
            `${field}-${index}`
        );


    const editArea =
        document.getElementById(
            `${field}-edit-${index}`
        );


    if (
        !display ||
        !editArea
    ) {
        return;
    }


    // Prevent multiple edit boxes
    if (
        editArea.innerHTML !== ""
    ) {

        return;
    }


    // Hide current value
    display.style.display =
        "none";


    // Create input
    editArea.innerHTML = `

        <input
            type="text"
            id="input-${field}-${index}"
            value="${escapeAttribute(value)}"
        >


        <button
            class="save-btn"
            onclick="saveField(
                ${index},
                '${field}'
            )">

            Save

        </button>


        <button
            class="cancel-btn"
            onclick="cancelEdit(
                ${index},
                '${field}'
            )">

            Cancel

        </button>

    `;

}


// ==========================================
// SAVE FIELD
// ==========================================

function saveField(index, field) {

    const input =
        document.getElementById(
            `input-${field}-${index}`
        );


    if (!input) {
        return;
    }


    const newValue =
        input.value.trim();


    // Prevent empty values
    if (newValue === "") {

        alert(
            "This field cannot be empty."
        );

        return;
    }


    // Update selected field
    employees[index][field] =
        newValue;


    // Save changes
    saveEmployees();


    // Refresh table
    displayEmployees();


    alert(
        field.charAt(0).toUpperCase() +
        field.slice(1) +
        " updated successfully!"
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

    // ==========================================
    // EMPLOYEE ID
    // ==========================================

    const id =
        prompt(
            "Enter Employee ID:"
        );


    if (!id) {
        return;
    }


    const employeeId =
        id.trim();


    // ==========================================
    // CHECK DUPLICATE ID
    // ==========================================

    const existing =
        employees.find(
            function(emp) {

                return (
                    emp.id === employeeId
                );

            }
        );


    if (existing) {

        alert(
            "Employee ID already exists."
        );

        return;
    }


    // ==========================================
    // PASSWORD
    // ==========================================

    const password =
        prompt(
            "Enter Password:"
        );


    if (!password) {
        return;
    }


    // ==========================================
    // NAME
    // ==========================================

    const name =
        prompt(
            "Enter Name:"
        );


    if (!name) {
        return;
    }


    // ==========================================
    // DEPARTMENT
    // ==========================================

    const department =
        prompt(
            "Enter Department:"
        );


    if (!department) {
        return;
    }


    // ==========================================
    // DESIGNATION
    // ==========================================

    const designation =
        prompt(
            "Enter Designation:"
        );


    if (!designation) {
        return;
    }


    // ==========================================
    // EMAIL
    // ==========================================

    const email =
        prompt(
            "Enter Email:"
        );


    if (!email) {
        return;
    }


    // ==========================================
    // CREATE EMPLOYEE
    // ==========================================

    const newEmployee = {

        id: employeeId,

        password: password.trim(),

        name: name.trim(),

        department: department.trim(),

        designation: designation.trim(),

        email: email.trim()

    };


    // Add employee
    employees.push(
        newEmployee
    );


    // Save
    saveEmployees();


    // Refresh table
    displayEmployees();


    alert(
        "Employee added successfully!"
    );

}


// ==========================================
// DELETE EMPLOYEE
// ==========================================

function deleteEmployee(index) {

    const employee =
        employees[index];


    if (!employee) {
        return;
    }


    const confirmation =
        confirm(
            `Are you sure you want to delete ${employee.name}?`
        );


    if (!confirmation) {
        return;
    }


    // Remove employee
    employees.splice(
        index,
        1
    );


    // Save
    saveEmployees();


    // Refresh table
    displayEmployees();


    alert(
        "Employee deleted successfully!"
    );

}


// ==========================================
// MANAGER PAGE
// ==========================================

if (
    window.location.pathname.includes(
        "manager.html"
    )
) {

    loadData().then(function() {

        const role =
            sessionStorage.getItem(
                "role"
            );


        // Only Manager can access
        if (role !== "manager") {

           window.location.replace("index.html?expired=true");

            return;
        }


        displayManagerEmployees();

    });

}


// ==========================================
// DISPLAY EMPLOYEES FOR MANAGER
// ==========================================

function displayManagerEmployees() {

    const table =
        document.getElementById(
            "managerEmployeeTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = "";


    employees.forEach(
        function(employee) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHTML(employee.id)}
                </td>

                <td>
                    ${escapeHTML(employee.name)}
                </td>

                <td>
                    ${escapeHTML(employee.department)}
                </td>

                <td>
                    ${escapeHTML(employee.designation)}
                </td>

                <td>
                    ${escapeHTML(employee.email)}
                </td>

            `;


            table.appendChild(row);

        }
    );

}


// ==========================================
// LOGOUT
// ==========================================

function logout() {

     sessionStorage.clear();

    window.location.replace("index.html");

}


// ==========================================
// SECURITY / HTML ESCAPING
// ==========================================

function escapeHTML(value) {

    if (value === undefined ||
        value === null) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// ESCAPE ATTRIBUTE VALUES
// ==========================================

function escapeAttribute(value) {

    if (value === undefined ||
        value === null) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}