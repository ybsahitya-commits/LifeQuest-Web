// --- 1. DATA & INITIALIZATION ---
let userData = JSON.parse(localStorage.getItem('lifeQuestData')) || {
    birthday: null,
    lp: 0,
    isVacation: false,
    vibePoints: { focus: 0, presence: 0, energy: 0, grit: 0 },
    userTasks: { grit: [], focus: [], energy: [], presence: [] }
};

const categories = ['grit', 'focus', 'energy', 'presence'];

function saveData() {
    localStorage.setItem('lifeQuestData', JSON.stringify(userData));
}

// Age Calculation
function calculateAge(birthdate) {
    const diff = Date.now() - new Date(birthdate).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

// First Time Setup
if (!userData.birthday) {
    document.getElementById('setup-overlay').style.display = 'flex';
}

document.getElementById('start-btn').onclick = () => {
    const bday = document.getElementById('birthdate-input').value;
    if (bday) {
        userData.birthday = bday;
        saveData();
        document.getElementById('setup-overlay').style.display = 'none';
        updateHomeUI();
    }
};

// --- 2. NAVIGATION ---
function showView(viewName) {
    ['home', 'quests', 'focus'].forEach(v => {
        document.getElementById(`${v}-view`).style.display = (v === viewName) ? 'block' : 'none';
        document.getElementById(`${v}-btn`).classList.toggle('active-tab', v === viewName);
    });
    if (viewName === 'quests') renderCategories();
    if (viewName === 'home') updateHomeUI();
}

document.getElementById('home-btn').onclick = () => showView('home');
document.getElementById('quest-btn').onclick = () => showView('quests');
document.getElementById('focus-btn').onclick = () => showView('focus');

// --- 3. QUEST LOGIC ---
function renderCategories() {
    const list = document.getElementById('category-list');
    list.innerHTML = '';
    categories.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <div class="category-header">
                <span class="category-name">${cat}</span>
                <button class="add-task-btn" onclick="showInput('${cat}')"><span class="plus-circle">+</span> Add Task</button>
            </div>
            <div id="input-area-${cat}"></div>
            <div id="tasks-${cat}">${renderTasks(cat)}</div>`;
        list.appendChild(card);
    });
    const cb = document.createElement('button');
    cb.className = 'clear-btn'; cb.innerText = 'Clear Finished'; cb.onclick = clearFinished;
    list.appendChild(cb);
}

function renderTasks(cat) {
    return userData.userTasks[cat].map((t, i) => `
        <div class="task-item" style="opacity: ${t.completed ? 0.5 : 1}">
            <div class="task-dot ${t.completed ? 'filled' : ''}" onclick="completeTask(${i}, '${cat}')"></div>
            <span style="text-decoration: ${t.completed ? 'line-through' : 'none'}">${t.text}</span>
        </div>`).join('');
}

function showInput(cat) {
    document.getElementById(`input-area-${cat}`).innerHTML = `<input type="text" class="inline-input" onkeydown="handleKey(event, '${cat}')">`;
    document.getElementById(`input-area-${cat}`).querySelector('input').focus();
}

function handleKey(e, cat) {
    if (e.key === 'Enter' && e.target.value !== "") {
        userData.userTasks[cat].push({ text: e.target.value, completed: false });
        saveData(); renderCategories();
    }
}

function completeTask(i, cat) {
    const t = userData.userTasks[cat][i];
    if (!t.completed) addLP(50, cat);
    t.completed = !t.completed;
    saveData(); renderCategories();
}

function clearFinished() {
    categories.forEach(c => userData.userTasks[c] = userData.userTasks[c].filter(t => !t.completed));
    saveData(); renderCategories();
}

// --- 4. TIMER LOGIC ---
let timerInt = null, timerMode = 'down', secsElapsed = 0, targetSecs = 1500;

document.getElementById('mode-down').onclick = () => setTimerMode('down');
document.getElementById('mode-up').onclick = () => setTimerMode('up');

function setTimerMode(m) {
    timerMode = m;
    document.getElementById('mode-down').classList.toggle('active', m === 'down');
    document.getElementById('mode-up').classList.toggle('active', m === 'up');
    updateTimerDisplay();
}

function updateTimerDisplay() {
    let s = timerMode === 'down' ? Math.max(0, targetSecs - secsElapsed) : secsElapsed;
    document.getElementById('timer-display').innerText = `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
}

document.getElementById('start-stop-btn').onclick = function() {
    if (timerInt) {
        clearInterval(timerInt); timerInt = null; this.innerText = "Start";
        if (timerMode === 'up' && secsElapsed > 60) addLP(Math.floor(secsElapsed/60)*2, 'focus');
    } else {
        if (timerMode === 'down') { targetSecs = document.getElementById('custom-time').value * 60; secsElapsed = 0; }
        this.innerText = "Pause";
        timerInt = setInterval(() => {
            secsElapsed++; updateTimerDisplay();
            if (timerMode === 'down' && secsElapsed >= targetSecs) {
                clearInterval(timerInt); timerInt = null; addLP(100, 'focus'); alert("Focus Complete!"); this.innerText = "Start";
            }
        }, 1000);
    }
};

// --- 5. UI UPDATES ---
function addLP(amt, cat) {
    if (userData.isVacation) return;
    userData.lp += amt; userData.vibePoints[cat] += amt; saveData(); updateHomeUI();
}

function updateHomeUI() {
    const level = Math.floor(userData.lp / 1000) + 1;
    const titles = ["Seedling 🌱", "Sprout 🌿", "Sapling 🌳", "Guardian 🛡️", "Ancient Oak 👑"];
    document.getElementById('active-mode').innerText = `Lvl ${level}: ${titles[level-1] || titles[4]}`;
    document.getElementById('lp-bar-fill').style.width = (userData.lp % 1000) / 10 + "%";
    if (userData.birthday) document.getElementById('life-age').innerText = `Age ${calculateAge(userData.birthday)}`;
}

updateHomeUI();
