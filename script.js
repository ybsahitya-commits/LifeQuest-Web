// --- 1. INITIAL DATA ---
let userData = {
    age: 16,
    lp: 0,
    isVacation: false,
    vibePoints: {
        focus: 0,
        presence: 0,
        energy: 0,
        grit: 0
    }
};

// --- 2. THE LOGIC ---

// Calculate which "Active Mode" (Archetype) the user is in
function updateArchetype() {
    const vibes = userData.vibePoints;
    let highestVibe = 'focus';
    
    for (let vibe in vibes) {
        if (vibes[vibe] > vibes[highestVibe]) {
            highestVibe = vibe;
        }
    }

    const modeDisplay = document.getElementById('active-mode');
    const archetypes = {
        focus: "The Deep Diver",
        presence: "The Social Lead",
        energy: "The Peak Performer",
        grit: "The Hard-Liner"
    };

    modeDisplay.innerText = archetypes[highestVibe];
}

// Add LP and update the progress bar
function addLP(amount, category) {
    if (userData.isVacation) return; // Stop points if on vacation

    userData.lp += amount;
    userData.vibePoints[category] += amount;

    // Update the UI
    const bar = document.getElementById('lp-bar-fill');
    let progress = (userData.lp % 1000) / 10; // Simple percentage math
    bar.style.width = progress + "%";

    updateArchetype();
    console.log(`Earned ${amount} LP in ${category}!`);
}

// Toggle Vacation Mode
document.getElementById('vacation-toggle').addEventListener('click', () => {
    userData.isVacation = !userData.isVacation;
    const btn = document.getElementById('vacation-toggle');
    const charImg = document.getElementById('main-character');

    if (userData.isVacation) {
        btn.innerText = "😎"; // Sunglasses icon
        charImg.style.opacity = "0.7"; // Character looks "chilled out"
    } else {
        btn.innerText = "🌴";
        charImg.style.opacity = "1";
    }
});

// --- 3. TEST COMMAND ---
// You can run addLP(50, 'focus') in the browser console to see it work!
const categories = ['grit', 'focus', 'energy', 'presence'];

// --- Navigation Logic ---
function showView(viewName) {
    document.getElementById('home-view').style.display = viewName === 'home' ? 'block' : 'none';
    document.getElementById('quests-view').style.display = viewName === 'quests' ? 'block' : 'none';
    
    // Update Nav Colors
    document.getElementById('home-btn').classList.toggle('active-tab', viewName === 'home');
    document.getElementById('quest-btn').classList.toggle('active-tab', viewName === 'quests');
}

document.getElementById('home-btn').onclick = () => showView('home');
document.getElementById('quest-btn').onclick = () => {
    showView('quests');
    renderCategories();
};

// --- RENDER CATEGORY CARDS ---
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
    });

    // Add the Clear Button at the bottom
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
        const taskList = document.getElementById(`tasks-${cat}`);
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-item';
        taskDiv.innerHTML = `
            <div class="task-dot" onclick="completeTask(this, '${cat}')"></div>
            <span>${e.target.value}</span>
        `;
        taskList.appendChild(taskDiv);
        e.target.value = ""; // Clear input
    }
}

function completeTask(dot, cat) {
    dot.classList.toggle('filled');
    const text = dot.nextElementSibling;
    text.style.textDecoration = dot.classList.contains('filled') ? "line-through" : "none";
    
    if (dot.classList.contains('filled')) {
        addLP(50, cat);
    }
}

function clearFinished() {
    const finishedItems = document.querySelectorAll('.task-dot.filled');
    finishedItems.forEach(dot => {
        dot.parentElement.remove();
    });
}
