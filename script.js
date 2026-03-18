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
