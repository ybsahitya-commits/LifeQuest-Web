// --- 1. INITIAL DATA & STORAGE ---
// This checks if you have saved data in the browser "vault". 
// If not, it starts with a clean slate.
let userData = JSON.parse(localStorage.getItem('lifeQuestData')) || {
    age: 16,
    lp: 0,
    isVacation: false,
    vibePoints: { focus: 0, presence: 0, energy: 0, grit: 0 },
    userTasks: { grit: [], focus: [], energy: [], presence: [] }
};

const categories = ['grit', 'focus', 'energy', 'presence'];

// Function to save everything to the browser's hard drive
function saveData() {
    localStorage.setItem('lifeQuestData', JSON.stringify(userData));
}

// --- 2. NAVIGATION LOGIC ---
function showView(viewName) {
    document.getElementById('home-view').style.display = viewName === 'home' ? 'block' : 'none';
    document.getElementById('quests-view').style.display = viewName === 'quests' ? 'block' : 'none';
    
    // Update Nav Colors (Purple for active)
    document.getElementById('home-btn').classList.toggle('active-tab', viewName === 'home');
    document.getElementById('quest-btn').classList.toggle('active-tab', viewName === 'quests');
    
    if (viewName === 'quests') renderCategories();
    if (viewName === 'home') updateHomeUI();
}

document.getElementById('home-btn').onclick = () => showView('home');
document.getElementById('quest-btn').onclick = () => showView('quests');

// --- 3. QUEST & TASK LOGIC ---
function renderCategories() {
    const list = document.getElementById('category-list');
    list.innerHTML = ''; 

    categories.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <div class="category-header">
                <span class="category-name">${cat}</span>
                <button class="add-task-btn" onclick="showInput('${cat}')">
                    <span class="plus-circle">+</span> Add Task
                </button>
            </div>
            <div id="input-area-${cat}"></div>
            <div id="tasks-${cat}"></div>
        `;
        list.appendChild(card);

        const taskList = document.getElementById(`tasks-${cat}`);
        userData.userTasks[cat].forEach((task, index) => {
            const taskDiv = document.createElement('div');
            taskDiv.className = 'task-item';
            if (task.completed) taskDiv.style.opacity = "0.5";
            
            taskDiv.innerHTML = `
                <div class="task-dot ${task.completed ? 'filled' : ''}" 
                     onclick="completeTask(${index}, '${cat}')"></div>
                <span style="text-decoration: ${task.completed ? 'line-through' : 'none'}">
                    ${task.text}
                </span>
            `;
            taskList.appendChild(taskDiv);
        });
    });

    const clearBtn = document.createElement('button');
    clearBtn.className = 'clear-btn';
    clearBtn.innerText = 'Clear Finished Tasks';
    clearBtn.onclick = clearFinished;
    list.appendChild(clearBtn);
}

function showInput(cat) {
    const area = document.getElementById(`input-area-${cat}`);
    area.innerHTML = `<input type="text" class="inline-input" placeholder="Type and press Enter..." onkeydown="handleKey(event, '${cat}')">`;
    area.querySelector('input').focus();
}

function handleKey(e, cat) {
    if (e.key === 'Enter' && e.target.value !== "") {
        userData.userTasks[cat].push({ text: e.target.value, completed: false });
        e.target.value = ""; 
        saveData();
        renderCategories();
    }
}

function completeTask(index, cat) {
    const task = userData.userTasks[cat][index];
    if (!task.completed) {
        addLP(50, cat);
    }
    task.completed = !task.completed;
    saveData();
    renderCategories();
}

function clearFinished() {
    categories.forEach(cat => {
        userData.userTasks[cat] = userData.userTasks[cat].filter(t => !t.completed);
    });
    saveData();
    renderCategories();
}

// --- 4. CORE ENGINE (LP & UI) ---
function addLP(amount, category) {
    if (userData.isVacation) return;
    userData.lp += amount;
    userData.vibePoints[category] += amount;
    saveData();
    updateHomeUI();
}

function updateHomeUI() {
    // Update LP Bar
    const bar = document.getElementById('lp-bar-fill');
    if (bar) {
        let progress = (userData.lp % 1000) / 10;
        bar.style.width = progress + "%";
    }
    
    // Update Archetype
    const vibes = userData.vibePoints;
    let highestVibe = 'focus';
    for (let v in vibes) {
        if (vibes[v] > vibes[highestVibe]) highestVibe = v;
    }
    const modeDisplay = document.getElementById('active-mode');
    const archetypes = { focus: "Deep Diver", presence: "Social Lead", energy: "Peak Performer", grit: "Hard-Liner" };
    if (modeDisplay) modeDisplay.innerText = archetypes[highestVibe];
}

// Initialize on Load
updateHomeUI();
