// Data structure
let currentStudent = null;
let selectedGroup = null;
let students = [];

const courses = ["Programming", "Physics 1", "Mathematics 2", "Writing and Research Skills"];
const groupSlots = {
    1: {"Programming": 15, "Physics 1": 15, "Mathematics 2": 15, "Writing and Research Skills": 15},
    2: {"Programming": 15, "Physics 1": 15, "Mathematics 2": 15, "Writing and Research Skills": 15},
    3: {"Programming": 15, "Physics 1": 15, "Mathematics 2": 15, "Writing and Research Skills": 15},
    4: {"Programming": 15, "Physics 1": 15, "Mathematics 2": 15, "Writing and Research Skills": 15}
};

// Initialize from memory
function init() {
    const stored = loadFromMemory();
    if (stored) {
        students = stored.students || [];
        recalculateSlots();
    }
}

function loadFromMemory() {
    const data = localStorage.getItem('registrationData');
    return data ? JSON.parse(data) : null;
}

function saveToMemory() {
    localStorage.setItem('registrationData', JSON.stringify({students}));
}

function recalculateSlots() {
    // Reset slots
    for (let g = 1; g <= 4; g++) {
        courses.forEach(course => {
            groupSlots[g][course] = 15;
        });
    }
    
    // Deduct based on registered students
    students.forEach(student => {
        courses.forEach(course => {
            if (student.classes[course] > 0) {
                groupSlots[student.classes[course]][course]--;
            }
        });
    });
}

function showScreen(screenId) {
    document.querySelectorAll('.container > div').forEach(div => div.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

function showWelcomeScreen() {
    showScreen('welcomeScreen');
}

function showRegisterScreen() {
    showScreen('registerScreen');
    document.getElementById('regName').value = '';
    document.getElementById('regID').value = '';
    document.getElementById('nameError').textContent = '';
    document.getElementById('idError').textContent = '';
}

function showLoginScreen() {
    showScreen('loginScreen');
    document.getElementById('loginID').value = '';
    document.getElementById('loginError').textContent = '';
}

function showMainMenu() {
    showScreen('mainMenu');
    if (currentStudent) {
        let info = `<strong>Name:</strong> ${currentStudent.name}<br>
                   <strong>ID:</strong> ${currentStudent.id}<br>
                   <strong>Semester:</strong> ${currentStudent.semester}F-${currentStudent.year}`;
        
        let registered = courses.filter(c => currentStudent.classes[c] > 0);
        if (registered.length > 0) {
            info += '<br><br><strong>Registered Courses:</strong><br>';
            registered.forEach(c => {
                info += `• ${c}: 1E${currentStudent.classes[c]}<br>`;
            });
        }
        
        document.getElementById('studentInfo').innerHTML = info;
    }
}

function registerStudent() {
    const name = document.getElementById('regName').value.trim();
    const id = document.getElementById('regID').value.trim();
    const semester = document.getElementById('regSemester').value;
    const year = document.getElementById('regYear').value;

    let valid = true;

    // Validate name
    if (!name) {
        document.getElementById('nameError').textContent = 'Name cannot be empty!';
        valid = false;
    } else if (/\d/.test(name)) {
        document.getElementById('nameError').textContent = 'Name cannot contain numbers!';
        valid = false;
    } else {
        document.getElementById('nameError').textContent = '';
    }

    // Validate ID
    if (id.length !== 9) {
        document.getElementById('idError').textContent = 'ID must be 9 digits!';
        valid = false;
    } else if (!id.startsWith('7000')) {
        document.getElementById('idError').textContent = 'ID must start with 7000!';
        valid = false;
    } else if (students.some(s => s.id === id)) {
        document.getElementById('idError').textContent = 'This ID is already registered!';
        valid = false;
    } else {
        document.getElementById('idError').textContent = '';
    }

    if (!valid) return;

    currentStudent = {
        id,
        name,
        semester: parseInt(semester),
        year: parseInt(year),
        classes: {"Programming": 0, "Physics 1": 0, "Mathematics 2": 0, "Writing and Research Skills": 0}
    };

    students.push(currentStudent);
    saveToMemory();
    showMainMenu();
}

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

function showGroupSelection() {
    showScreen('groupSelection');
}

function selectGroup(group) {
    selectedGroup = group;
    showCourseSelection();
}

function showCourseSelection() {
    showScreen('courseSelection');
    document.getElementById('selectedGroupName').textContent = '1E' + selectedGroup;
    
    const courseList = document.getElementById('courseList');
    courseList.innerHTML = '';

    courses.forEach((course, index) => {
        const slots = groupSlots[selectedGroup][course];
        const registered = currentStudent.classes[course];
        
        const div = document.createElement('div');
        div.className = 'course-item';
        
        let status = '';
        let btnDisabled = false;
        
        if (registered > 0) {
            status = `<span style="color: #dc3545;">Already registered in 1E${registered}</span>`;
            btnDisabled = true;
        } else if (slots === 0) {
            status = `<span class="slots-full">No slots available</span>`;
            btnDisabled = true;
        } else {
            status = `<span class="slots-available">${slots} slots available</span>`;
        }
        
        div.innerHTML = `
            <div class="course-info">
                <div class="course-name">${course}</div>
                <div>${status}</div>
            </div>
            <button class="btn" onclick="registerCourse('${course}')" ${btnDisabled ? 'disabled' : ''}>
                Register
            </button>
        `;
        
        courseList.appendChild(div);
    });
}

function registerCourse(course) {
    if (groupSlots[selectedGroup][course] === 0) {
        alert('Sorry, no slots available!');
        return;
    }

    if (currentStudent.classes[course] > 0) {
        alert('You already registered for this course!');
        return;
    }

    currentStudent.classes[course] = selectedGroup;
    groupSlots[selectedGroup][course]--;
    saveToMemory();
    
    alert(`Successfully registered for ${course} in 1E${selectedGroup}!`);
    showCourseSelection();
}

function registerAllCourses() {
    let canRegister = true;
    let reasons = [];

    courses.forEach(course => {
        if (currentStudent.classes[course] > 0) {
            canRegister = false;
            reasons.push(`Already registered for ${course}`);
        }
        if (groupSlots[selectedGroup][course] === 0) {
            canRegister = false;
            reasons.push(`No slots for ${course}`);
        }
    });

    if (!canRegister) {
        alert('Cannot register all units:\n' + reasons.join('\n'));
        return;
    }

    courses.forEach(course => {
        currentStudent.classes[course] = selectedGroup;
        groupSlots[selectedGroup][course]--;
    });

    saveToMemory();
    alert(`Successfully registered ALL units in 1E${selectedGroup}!`);
    showMainMenu();
}

function showRecord() {
    showScreen('recordView');
    
    const registered = courses.filter(c => currentStudent.classes[c] > 0);
    
    if (registered.length === 0) {
        document.getElementById('recordContent').innerHTML = '<p>You have not registered for any courses yet!</p>';
        return;
    }

    let html = `
        <table class="record-table">
            <tr>
                <th>Unit</th>
                <th>Group</th>
            </tr>
    `;

    registered.forEach(course => {
        html += `
            <tr>
                <td>${course}</td>
                <td>1E${currentStudent.classes[course]}</td>
            </tr>
        `;
    });

    html += '</table>';
    document.getElementById('recordContent').innerHTML = html;
}

function printRecord() {
    const registered = courses.filter(c => currentStudent.classes[c] > 0);
    
    let content = '========== GROUPING RECORD ==========\n\n';
    content += `Student: ${currentStudent.name}\n`;
    content += `ID: ${currentStudent.id}\n`;
    content += `Trimester: ${currentStudent.semester}F-${currentStudent.year}\n\n`;
    content += 'Unit                                Group\n';
    content += '=============================================\n';
    
    registered.forEach(course => {
        content += `${course.padEnd(35)} 1E${currentStudent.classes[course]}\n`;
    });
    
    content += '=============================================\n';
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Record.txt';
    a.click();
    
    alert('Record saved to Record.txt');
}

function showAllStudents() {
    showScreen('allStudentsView');
    
    let html = '';
    
    if (students.length === 0) {
        html = '<p>No students registered yet.</p>';
    } else {
        students.forEach((student, index) => {
            const registered = courses.filter(c => student.classes[c] > 0);
            
            html += `
                <div class="student-card">
                    <strong>[${index + 1}] ID:</strong> ${student.id} | 
                    <strong>Name:</strong> ${student.name} | 
                    <strong>Semester:</strong> ${student.semester}F-${student.year}
            `;
            
            if (registered.length > 0) {
                html += '<br>';
                registered.forEach(c => {
                    html += `<br>• ${c}: 1E${student.classes[c]}`;
                });
            }
            
            html += '</div>';
        });
        
        html += `<p><strong>Total Students: ${students.length}</strong></p>`;
    }
    
    document.getElementById('allStudentsContent').innerHTML = html;
}

function exitProgram() {
    if (confirm('Are you sure you want to exit?')) {
        saveToMemory();
        showScreen('developerInfo');
    }
}

// Initialize on load
init();
