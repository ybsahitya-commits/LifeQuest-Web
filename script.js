// --- 1. DATA STORAGE ---
let userData = JSON.parse(localStorage.getItem('lifeQuestData')) || {
    birthday: null, lp: 0, 
    userTasks: { grit: [], focus: [], energy: [], presence: [] }
};

const categories = ['grit', 'focus', 'energy', 'presence'];
const ring = document.getElementById('timer-ring');
const circumference = 2 * Math.PI * 90;

function saveData() { localStorage.setItem('lifeQuestData', JSON.stringify(userData)); }

// --- 2. INITIALIZATION & AGE ---
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

// --- 3. NAVIGATION ---
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

// --- 4. QUEST SYSTEM ---
function renderQuests() {
    const list = document.getElementById('category-list');
    list.innerHTML = ''; 

    categories.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <div class="category-header">
                <span>${cat}</span>
                <button class="add-task-btn" onclick="addInLine('${cat}')">
                    <div class="plus-circle">+</div> Add Task
                </button>
            </div>
            <div id="input-zone-${cat}"></div>
            <div id="task-list-${cat}">
                ${userData.userTasks[cat].map((t, i) => `
                    <div class="task-item">
                        <div class="task-dot ${t.done ? 'filled' : ''}" onclick="toggleTask(${i},'${cat}')"></div>
                        <span style="${t.done ? 'text-decoration:line-through; opacity:0.5' : ''}">${t.text}</span>
                    </div>
                `).join('')}
            </div>
        `;
        list.appendChild(card);
    });

    const clearBtn = document.createElement('button');
    clearBtn.className = 'control-btn'; clearBtn.style.width = "100%"; 
    clearBtn.innerText = 'Clear Finished Tasks'; 
    clearBtn.onclick = clearTasks;
    list.appendChild(clearBtn);
}

function addInLine(cat) {
    const zone = document.getElementById(`input-zone-${cat}`);
    zone.innerHTML = `<input type="text" class="inline-input" placeholder="Enter task..." onkeydown="saveTask(event,'${cat}')">`;
    zone.querySelector('input').focus();
}

function saveTask(e, cat) {
    if (e.key === 'Enter' && e.target.value) {
        userData.userTasks[cat].push({ text: e.target.value, done: false });
        saveData();
        renderQuests();
    }
}

function toggleTask(i, cat) {
    const t = userData.userTasks[cat][i];
    if (!t.done) userData.lp += 50; 
    t.done = !t.done;
    saveData();
    renderQuests();
    updateUI();
}

function clearTasks() {
    categories.forEach(c => userData.userTasks[c] = userData.userTasks[c].filter(t => !t.done));
    saveData();
    renderQuests();
}

// --- 5. TIMER SYSTEM ---
let timerPtr = null, timerMode = 'down', elapsed = 0, total = 1800; // 30 mins

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
        if (elapsed > 60) {
            let bonus = Math.floor(Math.random() * 20) + 1;
            userData.lp += (Math.floor(elapsed/60) + bonus);
            saveData();
            updateUI();
        }
    } else {
        this.innerText = "Pause";
        timerPtr = setInterval(() => {
            elapsed++; updateClock();
            if (timerMode === 'down' && elapsed >= total) {
                clearInterval(timerPtr); timerPtr = null; 
                userData.lp += 50; saveData(); updateUI();
                alert("Session Complete!");
                this.innerText = "Start Session";
            }
        }, 1000);
    }
};

// --- 6. GLOBAL UI ---
function updateUI() {
    const lvl = Math.floor(userData.lp / 1000) + 1;
    const titles = ["Seedling 🌱", "Sprout 🌿", "Sapling 🌳", "Guardian 🛡️", "Ancient Oak 👑"];
    document.getElementById('active-mode').innerText = `Lvl ${lvl}: ${titles[lvl-1] || titles[4]}`;
    document.getElementById('lp-bar-fill').style.width = (userData.lp % 1000) / 10 + "%";
    
    if (userData.birthday) {
        document.getElementById('life-age').innerText = `Age ${getAge(userData.birthday)}`;
    }
}
