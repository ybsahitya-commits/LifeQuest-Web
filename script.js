let userData = JSON.parse(localStorage.getItem('lifeQuestData')) || {
    birthday: null, lp: 0, vibePoints: { focus: 0, presence: 0, energy: 0, grit: 0 },
    userTasks: { grit: [], focus: [], energy: [], presence: [] }
};

const categories = ['grit', 'focus', 'energy', 'presence'];
const ring = document.getElementById('timer-ring');
const radius = ring.r.baseVal.value;
const circumference = 2 * Math.PI * radius;
ring.style.strokeDasharray = `${circumference} ${circumference}`;

function saveData() { localStorage.setItem('lifeQuestData', JSON.stringify(userData)); }

// Age & Setup
if (!userData.birthday) document.getElementById('setup-overlay').style.display = 'flex';
document.getElementById('start-btn').onclick = () => {
    const bday = document.getElementById('birthdate-input').value;
    if (bday) { userData.birthday = bday; saveData(); location.reload(); }
};

function getAge(birthdate) {
    return Math.floor((Date.now() - new Date(birthdate).getTime()) / 31557600000);
}

// Navigation
function showView(view) {
    ['home', 'quests', 'focus'].forEach(v => {
        document.getElementById(`${v}-view`).style.display = v === view ? 'block' : 'none';
        document.getElementById(`${v}-btn`).classList.toggle('active-tab', v === view);
    });
    if (view === 'quests') renderQuests();
    updateUI();
}
document.getElementById('home-btn').onclick = () => showView('home');
document.getElementById('quest-btn').onclick = () => showView('quests');
document.getElementById('focus-btn').onclick = () => showView('focus');

// Quests Logic
function renderQuests() {
    const list = document.getElementById('category-list');
    list.innerHTML = '';
    categories.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <div class="category-header">
                <span style="text-transform:capitalize; font-weight:bold;">${cat}</span>
                <button class="add-task-btn" onclick="showInLine('${cat}')"><div class="plus-circle">+</div> Add Task</button>
            </div>
            <div id="in-${cat}"></div>
            <div id="list-${cat}">${userData.userTasks[cat].map((t,i) => `
                <div class="task-item">
                    <div class="task-dot ${t.done ? 'filled' : ''}" onclick="toggleT(${i},'${cat}')"></div>
                    <span style="${t.done ? 'text-decoration:line-through; opacity:0.5' : ''}">${t.text}</span>
                </div>`).join('')}</div>`;
        list.appendChild(card);
    });
    const btn = document.createElement('button');
    btn.className='clear-btn'; btn.innerText='Clear Finished'; btn.onclick=clearT;
    list.appendChild(btn);
}

function showInLine(cat) {
    document.getElementById(`in-${cat}`).innerHTML = `<input type="text" class="inline-input" placeholder="Task name..." onkeydown="saveT(event,'${cat}')">`;
    document.getElementById(`in-${cat}`).querySelector('input').focus();
}

function saveT(e, cat) {
    if (e.key === 'Enter' && e.target.value) {
        userData.userTasks[cat].push({ text: e.target.value, done: false });
        saveData(); renderQuests();
    }
}

function toggleT(i, cat) {
    const t = userData.userTasks[cat][i];
    if (!t.done) addLP(50, cat);
    t.done = !t.done; saveData(); renderQuests();
}

function clearT() {
    categories.forEach(c => userData.userTasks[c] = userData.userTasks[c].filter(t => !t.done));
    saveData(); renderQuests();
}

// Timer Logic
let timerIdx = null, mode = 'down', elapsed = 0, total = 1800; // 30 mins

function setProgress(percent) {
    ring.style.strokeDashoffset = circumference - (percent / 100) * circumference;
}

function updateTimer() {
    let s = mode === 'down' ? total - elapsed : elapsed;
    document.getElementById('timer-display').innerText = `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
    setProgress((elapsed / total) * 100);
}

document.getElementById('mode-down').onclick = () => { mode = 'down'; updateTimer(); };
document.getElementById('mode-up').onclick = () => { mode = 'up'; updateTimer(); };

document.getElementById('start-stop-btn').onclick = function() {
    if (timerIdx) {
        clearInterval(timerIdx); timerIdx = null; this.innerText = "Start Session";
        if (elapsed > 60) {
            let bonus = Math.floor(Math.random() * 20) + 1;
            addLP(Math.floor(elapsed/60) + bonus, 'focus');
        }
    } else {
        this.innerText = "Pause";
        timerIdx = setInterval(() => {
            elapsed++; updateTimer();
            if (mode === 'down' && elapsed >= total) {
                clearInterval(timerInt); addLP(30 + Math.floor(Math.random()*20)+1, 'focus');
                alert("Session Finished!");
            }
        }, 1000);
    }
};

// UI Engine
function addLP(amt, cat) {
    userData.lp += amt; userData.vibePoints[cat] += amt; saveData(); updateUI();
}

function updateUI() {
    const lvl = Math.floor(userData.lp / 1000) + 1;
    const titles = ["Seedling 🌱", "Sprout 🌿", "Sapling 🌳", "Guardian 🛡️", "Ancient Oak 👑"];
    document.getElementById('active-mode').innerText = `Lvl ${lvl}: ${titles[lvl-1] || titles[4]}`;
    document.getElementById('lp-bar-fill').style.width = (userData.lp % 1000) / 10 + "%";
    if (userData.birthday) document.getElementById('life-age').innerText = `Age ${getAge(userData.birthday)}`;
}

updateUI();
