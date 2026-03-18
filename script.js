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
// --- 4. NAVIGATION & MODAL LOGIC ---

// Get the buttons by ID (Make sure these IDs are in your HTML!)
const questBtn = document.getElementById('quest-btn'); 
const focusBtn = document.getElementById('focus-btn');
const modal = document.getElementById('quest-modal');
const closeModal = document.getElementById('close-modal');
const saveQuest = document.getElementById('save-quest');

// Open the Quest popup
if (questBtn) {
    questBtn.onclick = function() {
        modal.style.display = "flex";
    }
}

// Focus Mode Logic (Switching the view)
if (focusBtn) {
    focusBtn.onclick = function() {
        // This hides the character and shows the timer (we'll build the timer next)
        const charSpace = document.querySelector('.character-space');
        charSpace.innerHTML = `
            <div class="timer-display">
                <h2 id="timer">25:00</h2>
                <button id="start-focus" class="badge">Start Focus</button>
            </div>
        `;
    }
}

// Close the popup when clicking "Cancel"
closeModal.onclick = function() {
    modal.style.display = "none";
}

// Save the Quest and add LP
saveQuest.onclick = function() {
    const name = document.getElementById('quest-name').value;
    const vibe = document.getElementById('quest-vibe').value;

    if (name === "") {
        alert("Please enter a task name!");
        return;
    }

    addLP(50, vibe);
    document.getElementById('quest-name').value = "";
    modal.style.display = "none";
}
