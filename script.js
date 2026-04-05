let userData = JSON.parse(localStorage.getItem('lifeQuestData')) || {
    birthday: null, lp: 0, 
    userTasks: { grit: [], focus: [], energy: [], presence: [] }
};

const categories = ['grit', 'focus', 'energy', 'presence'];

function saveData() { localStorage.setItem('lifeQuestData', JSON.stringify(userData)); }

// Initialize
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

// Navigation
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

// --- THE DAILY TASKS CODE ---
function renderQuests() {
    const list = document.getElementById('category-list');
    list.innerHTML = ''; // Clear existing cards

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
        renderQuests(); // Refresh the list
    }
}

function toggleTask(i, cat) {
    const t = userData.userTasks[cat][i];
    if (!t.done) {
        userData.lp += 50; // Award LP
    }
    t.done = !t.done;
    saveData();
    renderQuests();
    updateUI();
}

function updateUI() {
    const lvl = Math.floor(userData.lp / 1000) + 1;
    const titles = ["Seedling 🌱", "Sprout 🌿", "Sapling 🌳", "Guardian 🛡️", "Ancient Oak 👑"];
    document.getElementById('active-mode').innerText = `Lvl ${lvl}: ${titles[lvl-1] || titles[4]}`;
    document.getElementById('lp-bar-fill').style.width = (userData.lp % 1000) / 10 + "%";
    
    if (userData.birthday) {
        const age = Math.floor((Date.now() - new Date(userData.birthday).getTime()) / 31557600000);
        document.getElementById('life-age').innerText = `Age ${age}`;
    }
}
