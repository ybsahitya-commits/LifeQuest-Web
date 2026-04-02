let userData = JSON.parse(localStorage.getItem('lifeQuestData')) || {
    birthday: null, lp: 0, 
    userTasks: { grit: [], focus: [], energy: [], presence: [] }
};

const categories = ['grit', 'focus', 'energy', 'presence'];
const ring = document.getElementById('timer-ring');
const circumference = 2 * Math.PI * 90;

function saveData() { localStorage.setItem('lifeQuestData', JSON.stringify(userData)); }

// AGE SETUP logic
if (!userData.birthday) {
    document.getElementById('setup-overlay').style.display = 'flex';
} else {
    updateUI();
}

document.getElementById('start-btn').onclick = () => {
    const val = document.getElementById('birthdate-input').value;
    if (val) {
        userData.birthday = val;
        saveData();
        document.getElementById('setup-overlay').style.display = 'none';
        updateUI();
    }
};

function getAge(dob) {
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / 31557600000);
}

// NAVIGATION logic
function showView(view) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active-tab'));
    
    document.getElementById(`${view}-view`).style.display = 'block';
    document.getElementById(`${view}-btn`).classList.add('active-tab');
    
    if (view === 'quests') renderQuests();
    updateUI();
}

document.getElementById('home-btn').onclick = () => showView('home');
document.getElementById('quest-btn').onclick = () => showView('quests');
document.getElementById('focus-btn').onclick = () => showView('focus');

// QUEST logic
function renderQuests() {
    const list = document.getElementById('category-list');
    list.innerHTML = '';
    categories.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <div class="category-header">
                <span style="text-transform:capitalize; font-weight:800;">${cat}</span>
                <button class="add-task-btn" onclick="addInLine('${cat}')"><div class="plus-circle">+</div> Add Task</button>
            </div>
            <div id="input-zone-${cat}"></div>
            <div id="task-list-${cat}">${renderTaskItems(cat)}</div>
        `;
        list.appendChild(card);
    });
    const clearBtn = document.createElement('button');
    clearBtn.className = 'control-btn'; clearBtn.style.width = "100%"; 
    clearBtn.innerText = 'Clear Finished'; clearBtn.onclick = clearTasks;
    list.appendChild(clearBtn);
}

function renderTaskItems(cat) {
    return userData.userTasks[cat].map((t, i) => `
        <div class="task-item">
            <div class="task-dot ${t.done ? 'filled' : ''}" onclick="toggleTask(${i},'${cat}')"></div>
            <span style="${t.done ? 'text-decoration:line-through; opacity:0.5' : ''}">${t.text}</span>
        </div>
    `).join('');
}

function addInLine(cat) {
    document.getElementById(`input-zone-${cat}`).innerHTML = `<input type="text" class="inline-input" placeholder="Type task..." onkeydown="saveTask(event,'${cat}')">`;
    document.getElementById(`input-zone-${cat}`).querySelector('input').focus();
}

function saveTask(e, cat) {
    if (e.key === 'Enter' && e.target.value) {
        userData.userTasks[cat].push({ text: e.target.value, done: false });
        saveData(); renderQuests();
    }
}

function toggleTask(i, cat) {
    const t = userData.userTasks[cat][i];
    if (!t.done) addLP(50);
    t.done = !t.done; saveData(); renderQuests();
}

function clearTasks() {
    categories.forEach(c => userData.userTasks[c] = userData.userTasks[c].filter(t => !t.done));
    saveData(); renderQuests();
}

// TIMER logic
let timerPtr = null, timerMode = 'down', elapsed = 0, total = 1800; // 30m

document.getElementById('mode-down').onclick = () => { timerMode = 'down'; updateClock(); };
document.getElementById('mode-up').onclick = () => { timerMode = 'up'; updateClock(); };

function updateClock() {
    let s = timerMode === 'down' ? total - elapsed : elapsed;
    document.getElementById('timer-display').innerText = `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
    const offset = circumference - (elapsed / total) * circumference;
    ring.style.strokeDashoffset = offset;
}

document.getElementById('start-stop-btn').onclick = function() {
    if (timerPtr) {
        clearInterval(timerPtr); timerPtr = null; this.innerText = "Start Session";
        if (elapsed > 60) addLP(Math.floor(elapsed/60) + Math.floor(Math.random()*20));
    } else {
        this.innerText = "Pause";
        timerPtr = setInterval(() => {
            elapsed++; updateClock();
            if (timerMode === 'down' && elapsed >= total) {
                clearInterval(timerPtr); addLP(50); alert("Done!");
            }
        }, 1000);
    }
};

// UI UPDATE logic
function addLP(amt) { userData.lp += amt; saveData(); updateUI(); }

function updateUI() {
    const lvl = Math.floor(userData.lp / 1000) + 1;
    const titles = ["Seedling 🌱", "Sprout 🌿", "Sapling 🌳", "Guardian 🛡️", "Ancient Oak 👑"];
    document.getElementById('active-mode').innerText = `Lvl ${lvl}: ${titles[lvl-1] || titles[4]}`;
    document.getElementById('lp-bar-fill').style.width = (userData.lp % 1000) / 10 + "%";
    if (userData.birthday) document.getElementById('life-age').innerText = `Age ${getAge(userData.birthday)}`;
}
