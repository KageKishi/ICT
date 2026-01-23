// Data Storage
let students = JSON.parse(localStorage.getItem('students')) || [];
let currentStudent = null;
let groupSlots = {
    1: { Programming: 15, 'Physics 1': 15, 'Mathematics 2': 15, 'Writing and Research Skills': 15 },
    2: { Programming: 15, 'Physics 1': 15, 'Mathematics 2': 15, 'Writing and Research Skills': 15 },
    3: { Programming: 15, 'Physics 1': 15, 'Mathematics 2': 15, 'Writing and Research Skills': 15 },
    4: { Programming: 15, 'Physics 1': 15, 'Mathematics 2': 15, 'Writing and Research Skills': 15 }
};

// Initialize
function init() {
    recalculateSlots();
}

function recalculateSlots() {
    groupSlots = {
        1: { Programming: 15, 'Physics 1': 15, 'Mathematics 2': 15, 'Writing and Research Skills': 15 },
        2: { Programming: 15, 'Physics 1': 15, 'Mathematics 2': 15, 'Writing and Research Skills': 15 },
        3: { Programming: 15, 'Physics 1': 15, 'Mathematics 2': 15, 'Writing and Research Skills': 15 },
        4: { Programming: 15, 'Physics 1': 15, 'Mathematics 2': 15, 'Writing and Research Skills': 15 }
    };

    students.forEach(student => {
        if (student.courses.Programming) groupSlots[student.courses.Programming].Programming--;
        if (student.courses['Physics 1']) groupSlots[student.courses['Physics 1']]['Physics 1']--;
        if (student.courses['Mathematics 2']) groupSlots[student.courses['Mathematics 2']]['Mathematics 2']--;
        if (student.courses['Writing and Research Skills']) groupSlots[student.courses['Writing and Research Skills']]['Writing and Research Skills']--;
    });
}

// Screen Navigation
function showScreen(screenId) {
    document.querySelectorAll('.container > div').forEach(div => div.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

function showRegisterForm() {
    showScreen('registerForm');
}

function showLoginForm() {
    showScreen('loginForm');
}

function backToAuth() {
    showScreen('authScreen');
}

function backToMenu() {
    showScreen('mainMenu');
}

// Registration
function registerStudent() {
    const name = document.getElementById('regName').value.trim();
    const id = document.getElementById('regID').value.trim();
    const semester = document.getElementById('regSemester').value;
    const year = document.getElementById('regYear').value;

    // Validation
    if (!name) {
        document.getElementById('nameError').textContent = 'Name cannot be empty!';
        return;
    }
    if (/\d/.test(name)) {
        document.getElementById('nameError').textContent = 'Name cannot contain numbers!';
        return;
    }
    document.getElementById('nameError').textContent = '';

    if (id.length !== 9 || !id.startsWith('7000')) {
        document.getElementById('idError').textContent = 'ID must be 9 digits starting with 7000!';
        return;
    }
    document.getElementById('idError').textContent = '';

    if (students.find(s => s.id === id)) {
        document.getElementById('idError').textContent = 'This ID is already registered!';
        return;
    }

    if (!year || year < 1900 || year > 2100) {
        document.getElementById('yearError').textContent = 'Invalid year!';
        return;
    }
    document.getElementById('yearError').textContent = '';

    // Create student
    currentStudent = {
        id,
        name,
        semester,
        year,
        courses: { Programming: 0, 'Physics 1': 0, 'Mathematics 2': 0, 'Writing and Research Skills': 0 }
    };

    students.push(currentStudent);
    saveData();
    showMainMenu();
}

// Login
function loginStudent() {
    const id = document.getElementById('loginID').value.trim();
    const student = students.find(s => s.id === id);

    if (!student) {
        document.getElementById('loginError').textContent = 'Student ID not found!';
        return;
    }

    currentStudent = student;
    showMainMenu();
}

function showMainMenu() {
    document.getElementById('studentName').textContent = currentStudent.name;
    document.getElementById('studentIDDisplay').textContent = currentStudent.id;
    showScreen('mainMenu');
}

function logout() {
    currentStudent = null;
    showScreen('authScreen');
}

// Group Registration
function showGroupRegistration() {
    showScreen('groupRegistration');
    document.getElementById('groupSelect').value = '';
    document.getElementById('courseSelection').classList.add('hidden');
    
    document.getElementById('groupSelect').onchange = function() {
        const group = this.value;
        if (group) {
            displayCourses(parseInt(group));
            document.getElementById('courseSelection').classList.remove('hidden');
        }
    };
}

function displayCourses(group) {
    const courseList = document.getElementById('courseList');
    courseList.innerHTML = '';
    const courses = ['Programming', 'Physics 1', 'Mathematics 2', 'Writing and Research Skills'];

    courses.forEach(course => {
        const div = document.createElement('div');
        div.className = 'course-item';
        
        const slotsAvailable = groupSlots[group][course];
        const alreadyRegistered = currentStudent.courses[course] !== 0;
        
        div.innerHTML = `
            <div>
                <div class="course-name">${course}</div>
                <div class="slots-info">${slotsAvailable} slots available</div>
            </div>
            <button class="btn" style="width: auto; padding: 8px 16px; margin: 0;" 
                    onclick="registerCourse('${course}', ${group})"
                    ${slotsAvailable === 0 || alreadyRegistered ? 'disabled' : ''}>
                ${alreadyRegistered ? 'Registered' : 'Register'}
            </button>
        `;
        courseList.appendChild(div);
    });
}

function registerCourse(course, group) {
    if (currentStudent.courses[course] !== 0) {
        alert(`Already registered for ${course} in 1E${currentStudent.courses[course]}`);
        return;
    }

    if (groupSlots[group][course] === 0) {
        alert(`No slots available for ${course} in 1E${group}`);
        return;
    }

    currentStudent.courses[course] = group;
    groupSlots[group][course]--;
    saveData();
    alert(`Successfully registered for ${course} in 1E${group}!`);
    displayCourses(group);
}

function registerAllCourses() {
    const group = parseInt(document.getElementById('groupSelect').value);
    if (!group) {
        alert('Please select a group first!');
        return;
    }

    const courses = ['Programming', 'Physics 1', 'Mathematics 2', 'Writing and Research Skills'];
    let canRegister = true;
    let reasons = [];

    courses.forEach(course => {
        if (currentStudent.courses[course] !== 0) {
            canRegister = false;
            reasons.push(`Already registered for ${course} in 1E${currentStudent.courses[course]}`);
        }
        if (groupSlots[group][course] === 0) {
            canRegister = false;
            reasons.push(`No slots for ${course} in 1E${group}`);
        }
    });

    if (!canRegister) {
        alert('Cannot register all courses:\n' + reasons.join('\n'));
        return;
    }

    courses.forEach(course => {
        currentStudent.courses[course] = group;
        groupSlots[group][course]--;
    });

    saveData();
    alert(`Successfully registered ALL courses in 1E${group}!`);
    displayCourses(group);
}

// View Record
function showRecord() {
    const recordContent = document.getElementById('recordContent');
    let html = `
        <p><strong>Student:</strong> ${currentStudent.name}</p>
        <p><strong>ID:</strong> ${currentStudent.id}</p>
        <p><strong>Trimester:</strong> ${currentStudent.semester}F-${currentStudent.year}</p>
        <table class="record-table">
            <thead>
                <tr>
                    <th>Unit</th>
                    <th>Group</th>
                </tr>
            </thead>
            <tbody>
    `;

    let hasRegistrations = false;
    for (let course in currentStudent.courses) {
        if (currentStudent.courses[course] !== 0) {
            html += `
                <tr>
                    <td>${course}</td>
                    <td>1E${currentStudent.courses[course]}</td>
                </tr>
            `;
            hasRegistrations = true;
        }
    }

    if (!hasRegistrations) {
        html += '<tr><td colspan="2" style="text-align: center;">No courses registered yet</td></tr>';
    }

    html += '</tbody></table>';
    recordContent.innerHTML = html;
    showScreen('viewRecord');
}

function printRecord() {
    window.print();
}

// View All Students
function showAllStudents() {
    const studentsList = document.getElementById('studentsList');
    studentsList.innerHTML = '';

    if (students.length === 0) {
        studentsList.innerHTML = '<p style="text-align: center;">No students registered yet.</p>';
    } else {
        students.forEach((student, index) => {
            const div = document.createElement('div');
            div.className = 'student-card';
            let coursesHTML = '';
            for (let course in student.courses) {
                if (student.courses[course] !== 0) {
                    coursesHTML += `<div>• ${course}: 1E${student.courses[course]}</div>`;
                }
            }
            div.innerHTML = `
                <strong>[${index + 1}] ${student.name}</strong> (ID: ${student.id})<br>
                Semester: ${student.semester}F-${student.year}<br>
                ${coursesHTML || '<div style="color: #6c757d;">No courses registered</div>'}
            `;
            studentsList.appendChild(div);
        });
    }

    showScreen('allStudents');
}

// Data Persistence
function saveData() {
    localStorage.setItem('students', JSON.stringify(students));
    recalculateSlots();
}

// Initialize on load
init();
