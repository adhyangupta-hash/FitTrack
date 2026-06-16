// FitTrack Pro - Core Application Engine (Aesthetics: FitMonks Dark/Neon)

// Global State Object
let state = {
  auth: {
    isLoggedIn: false,
    userEmail: null
  },
  profile: {
    name: "Beginner Ben",
    gender: "Male",
    age: 24,
    height: 178,
    weight: 74.5,
    goal: "Lose Weight",
    activityLevel: "Moderate",
    calorieTarget: 2100,
    waterTarget: 2000 // ml
  },
  workouts: [], // Completed logs
  activeWorkout: {
    isActive: false,
    name: "",
    programName: "",
    startTime: null,
    durationSeconds: 0,
    exercises: [] // { id, name, sets: [{ weight, reps, completed }] }
  },
  nutrition: {}, // { "YYYY-MM-DD": { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0, foods: [] } }
  goals: [],
  weightLogs: [], // { date: "YYYY-MM-DD", weight: 74.5 }
  savedVideos: [], // Array of exercise IDs
  customPrograms: [] // Array of { name, description, days, exercises: [ids] }
};

// Ready-made Programs Data
const READY_PROGRAMS = [
  {
    id: "fullbody-beginner",
    name: "Beginner Full Body",
    description: "A perfect 3-day split designed to build base compound strength and learn exercise forms.",
    days: 3,
    difficulty: "Beginner",
    exercises: ["barbell-squat", "bench-press", "lat-pulldown", "overhead-press", "plank"]
  },
  {
    id: "push-pull-legs",
    name: "Push Pull Legs (PPL)",
    description: "High-volume athletic split targeting push muscles, pull muscles, and lower body separately.",
    days: 6,
    difficulty: "Intermediate",
    exercises: ["bench-press", "incline-dumbbell-press", "overhead-press", "lateral-raise", "tricep-pushdown", "pull-up", "barbell-row", "dumbbell-row", "barbell-curl", "barbell-squat", "romanian-deadlift", "leg-extension"]
  },
  {
    id: "fat-loss",
    name: "Fat Loss Circuit",
    description: "High-intensity metabolic conditioning combining full-body strength and cardiovascular intervals.",
    days: 4,
    difficulty: "Beginner",
    exercises: ["push-up", "cable-flyes", "treadmill-run", "jump-rope", "burpee", "russian-twist", "plank"]
  },
  {
    id: "muscle-gain",
    name: "Hypertrophy Muscle Builder",
    description: "Targeted resistance routine with progressive overload metrics to maximize muscle volume.",
    days: 5,
    difficulty: "Intermediate",
    exercises: ["bench-press", "lat-pulldown", "barbell-row", "lateral-raise", "dumbbell-hammer-curl", "tricep-overhead-extension", "barbell-squat", "romanian-deadlift"]
  }
];

// Global Timer Intervals
let activeWorkoutTimerInterval = null;
let restTimerInterval = null;
let restTimeRemaining = 0;
let restTimeTotal = 0;

// Chart.js Instances
let weightChartInstance = null;
let volumeChartInstance = null;

// Initializer
document.addEventListener("DOMContentLoaded", () => {
  loadStateFromLocalStorage();
  initializeDefaultData();
  lucide.createIcons();
  
  // Auth and workspace visibility sync
  toggleAppVisibility();
  
  // Render static data panels
  populateExerciseLibrary();
  renderVideosPlatform();
  renderProgramsList();
  
  // Sync Profile displays
  syncProfileUI();
  
  // Check active timers
  resumeActiveWorkoutTimerIfRunning();
});

// ==============================================
// LOCAL STORAGE & INITIAL SEEDS
// ==============================================
function loadStateFromLocalStorage() {
  const local = localStorage.getItem("fittrack_pro_state");
  if (local) {
    try {
      state = JSON.parse(local);
    } catch (e) {
      console.error("Error loading localStorage state:", e);
    }
  }
}

function saveStateToLocalStorage() {
  localStorage.setItem("fittrack_pro_state", JSON.stringify(state));
}

function initializeDefaultData() {
  // Setup default goals if empty
  if (!state.goals || state.goals.length === 0) {
    state.goals = [
      { id: "goal-weight", type: "Weight", title: "Reach Target Bodyweight", target: 70.0, current: state.profile.weight, unit: "kg", completed: false, dateCreated: getTodayDateString() },
      { id: "goal-frequency", type: "Consistency", title: "Complete Workouts Weekly", target: 4, current: 0, unit: "sessions", completed: false, dateCreated: getTodayDateString() },
      { id: "goal-hydration", type: "Hydration", title: "Drink Daily Water Target", target: 2000, current: 0, unit: "ml", completed: false, dateCreated: getTodayDateString() }
    ];
  }
  
  // Setup initial weight logs if empty
  if (!state.weightLogs || state.weightLogs.length === 0) {
    // Generate some mock history for the chart
    const today = new Date();
    state.weightLogs = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i * 4);
      state.weightLogs.push({
        date: d.toISOString().split("T")[0],
        weight: (state.profile.weight - (i * 0.4) + (Math.random() * 0.3)).toFixed(1)
      });
    }
    // ensure latest matches profile weight
    state.weightLogs.push({ date: getTodayDateString(), weight: state.profile.weight });
  }

  // Setup today's nutrition log if empty
  const todayStr = getTodayDateString();
  if (!state.nutrition[todayStr]) {
    state.nutrition[todayStr] = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      water: 0,
      foods: []
    };
  }
}

// ==============================================
// TAB NAVIGATION / ROUTING
// ==============================================
function switchTab(tabId) {
  // Session check guard
  if (!state.auth || !state.auth.isLoggedIn) {
    toggleAppVisibility();
    return;
  }

  // Update nav link UI
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(item => {
    if (item.getAttribute("data-tab") === tabId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Toggle visible views
  const views = document.querySelectorAll(".tab-view");
  views.forEach(view => {
    if (view.id === `view-${tabId}`) {
      view.classList.add("active");
    } else {
      view.classList.remove("active");
    }
  });

  // Scroll main view back to top
  document.querySelector(".main-content").scrollTop = 0;
  window.location.hash = tabId;

  // View specific refresh tasks
  if (tabId === "dashboard") {
    renderDashboardView();
  } else if (tabId === "tracker") {
    renderTrackerView();
  } else if (tabId === "progress") {
    initProgressCharts();
    renderWeightHistoryList();
  } else if (tabId === "nutrition") {
    renderNutritionView();
  } else if (tabId === "coach") {
    syncCoachMetadata();
  } else if (tabId === "profile") {
    populateProfileFormFields();
  }
}

// ==============================================
// VIEW RENDERERS & DATA BINDING
// ==============================================

// --- 1. DASHBOARD VIEW ---
function renderDashboardView() {
  const todayStr = getTodayDateString();
  const nutLog = state.nutrition[todayStr] || { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 };
  
  // Welcome Text & Profile Display name
  document.getElementById("welcome-text").textContent = `Welcome back, ${state.profile.name.split(" ")[0]}!`;
  document.getElementById("user-display-name").textContent = state.profile.name;
  document.getElementById("avatar-letter").textContent = state.profile.name.charAt(0).toUpperCase();

  // Calorie Ring Progress
  const calPercent = Math.min((nutLog.calories / state.profile.calorieTarget) * 100, 100);
  const circle = document.getElementById("calorie-progress-circle");
  // Circumference of r=60 is 2 * Math.PI * 60 = 377
  const offset = 377 - (377 * calPercent) / 100;
  circle.style.strokeDashoffset = offset;
  document.getElementById("dash-calories-val").textContent = Math.round(nutLog.calories);
  document.getElementById("dash-calories-target").textContent = state.profile.calorieTarget;
  
  // Mini Macros
  document.getElementById("dash-protein-val").textContent = `${Math.round(nutLog.protein)} / 150g`;
  document.getElementById("dash-carbs-val").textContent = `${Math.round(nutLog.carbs)} / 200g`;
  document.getElementById("dash-fats-val").textContent = `${Math.round(nutLog.fats)} / 65g`;

  // Streak & Workouts count
  document.getElementById("dash-streak-val").textContent = `${calculateStreak()} Days`;
  document.getElementById("dash-water-val").textContent = `${(nutLog.water / 250).toFixed(0)} / 8 cups`;
  document.getElementById("dash-total-workouts-val").textContent = `${state.workouts.length} Completed`;

  // Day Name
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  document.getElementById("dash-day-name").textContent = days[new Date().getDay()];

  // Active workout container sync
  const activeSec = document.getElementById("dash-active-workout-section");
  const inactiveSec = document.getElementById("dash-no-active-workout-section");
  if (state.activeWorkout.isActive) {
    activeSec.style.display = "block";
    inactiveSec.style.display = "none";
    document.getElementById("dash-active-workout-duration").textContent = `Duration: ${formatTime(state.activeWorkout.durationSeconds)}`;
  } else {
    activeSec.style.display = "none";
    inactiveSec.style.display = "block";
    renderDashboardRecommendations();
  }

  // Dashboard Goal progress list
  const goalsContainer = document.getElementById("dash-goals-container");
  goalsContainer.innerHTML = "";
  
  // Sync goal current progress values dynamically
  state.goals.forEach(goal => {
    if (goal.type === "Hydration") goal.current = nutLog.water;
    if (goal.type === "Consistency") goal.current = getWeeklyWorkoutCount();
  });
  
  state.goals.forEach(goal => {
    const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100);
    const item = document.createElement("div");
    item.className = "goal-card-item";
    item.innerHTML = `
      <div class="goal-header-row">
        <div style="display:flex; align-items:center; gap:0.5rem">
          <i data-lucide="${goal.type === 'Weight' ? 'scale' : goal.type === 'Hydration' ? 'droplet' : 'calendar'}" style="width:18px; height:18px; color:var(--neon-cyan)"></i>
          <span class="goal-title-lbl">${goal.title}</span>
        </div>
        <span class="goal-percent-lbl">${pct}% (${goal.current}/${goal.target} ${goal.unit})</span>
      </div>
      <div class="goal-progress-bar-outer">
        <div class="goal-progress-bar-inner" style="width: ${pct}%"></div>
      </div>
    `;
    goalsContainer.appendChild(item);
  });

  // Populate recommended tutorials on dashboard (Chest/Back/HIIT mix)
  const dashboardVids = document.getElementById("dash-recommended-videos");
  dashboardVids.innerHTML = "";
  // Pull first 3 exercises
  EXERCISES.slice(0, 3).forEach(ex => {
    const card = buildVideoCard(ex);
    dashboardVids.appendChild(card);
  });

  lucide.createIcons();
}

function renderDashboardRecommendations() {
  const container = document.getElementById("dash-program-recommendation-container");
  container.innerHTML = "";
  
  // Recommend 2 programs based on goal
  let recommended = [READY_PROGRAMS[0], READY_PROGRAMS[1]]; // defaults
  if (state.profile.goal === "Lose Weight") {
    recommended = [READY_PROGRAMS[2], READY_PROGRAMS[0]];
  } else if (state.profile.goal === "Gain Muscle") {
    recommended = [READY_PROGRAMS[3], READY_PROGRAMS[1]];
  }

  recommended.forEach(prog => {
    const div = document.createElement("div");
    div.style.backgroundColor = "var(--bg-card)";
    div.style.border = "1px solid var(--border-color)";
    div.style.padding = "1rem";
    div.style.borderRadius = "var(--border-radius-md)";
    div.style.flex = "1";
    div.style.minWidth = "220px";
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.justify = "space-between";
    div.innerHTML = `
      <div>
        <h4 style="margin-bottom: 0.25rem;">${prog.name}</h4>
        <p style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.75rem;">${prog.difficulty} • ${prog.days} Days/Week</p>
      </div>
      <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="startProgramWorkout('${prog.id}')">Start Routine</button>
    `;
    container.appendChild(div);
  });
}

function calculateStreak() {
  if (state.workouts.length === 0) return 0;
  // Simple streak check: how many consecutive days have logged workouts
  const uniqueDaysStr = [...new Set(state.workouts.map(w => w.dateStr))].sort((a,b) => new Date(b) - new Date(a));
  if (uniqueDaysStr.length === 0) return 0;
  
  const today = getTodayDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  // If latest workout was not today or yesterday, streak is broken
  if (uniqueDaysStr[0] !== today && uniqueDaysStr[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  for (let i = 0; i < uniqueDaysStr.length - 1; i++) {
    const cur = new Date(uniqueDaysStr[i]);
    const prev = new Date(uniqueDaysStr[i + 1]);
    const diff = (cur - prev) / (1000 * 60 * 60 * 24);
    if (diff <= 1.1) { // within 1 day diff
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function getWeeklyWorkoutCount() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday etc
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // start on Monday
  startOfWeek.setHours(0,0,0,0);

  return state.workouts.filter(w => new Date(w.dateStr) >= startOfWeek).length;
}

// --- 2. WORKOUT TRACKER VIEW ---
function renderTrackerView() {
  const inactiveState = document.getElementById("tracker-inactive-state");
  const activeState = document.getElementById("tracker-active-state");

  if (state.activeWorkout.isActive) {
    inactiveState.style.display = "none";
    activeState.style.display = "block";
    renderActiveWorkoutPanel();
  } else {
    inactiveState.style.display = "block";
    activeState.style.display = "none";
    renderRecentHistoryLogs();
  }
}

function renderRecentHistoryLogs() {
  const list = document.getElementById("tracker-recent-history-list");
  list.innerHTML = "";
  if (state.workouts.length === 0) {
    list.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 1rem 0;">No workouts logged yet.</p>`;
    return;
  }
  
  // Sort reverse chronological
  const sorted = [...state.workouts].sort((a,b) => new Date(b.startTime) - new Date(a.startTime)).slice(0, 4);
  sorted.forEach(w => {
    const div = document.createElement("div");
    div.style.padding = "0.75rem 1rem";
    div.style.backgroundColor = "rgba(255,255,255,0.02)";
    div.style.border = "1px solid var(--border-color)";
    div.style.borderRadius = "var(--border-radius-md)";
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";
    
    const dStr = new Date(w.startTime).toLocaleDateString(undefined, {month: "short", day: "numeric"});
    div.innerHTML = `
      <div>
        <h4 style="font-size: 0.95rem;">${w.name}</h4>
        <span style="font-size: 0.75rem; color: var(--text-secondary);">${dStr} • ${Math.round(w.duration / 60)} mins</span>
      </div>
      <div style="font-size: 0.8rem; font-weight: 700; color: var(--neon-lime); text-align: right;">
        <div>${w.totalVolume} kg</div>
        <div style="font-size:0.7rem; color: var(--text-muted)">${w.totalSets} sets</div>
      </div>
    `;
    list.appendChild(div);
  });
}

function renderActiveWorkoutPanel() {
  const titleInput = document.getElementById("active-workout-name");
  titleInput.value = state.activeWorkout.name;
  
  const progTag = document.getElementById("active-workout-program-tag");
  progTag.textContent = state.activeWorkout.programName || "Custom Workout";

  const container = document.getElementById("active-workout-exercises-container");
  container.innerHTML = "";

  const emptyState = document.getElementById("active-workout-empty-state");
  if (state.activeWorkout.exercises.length === 0) {
    emptyState.style.display = "flex";
    return;
  } else {
    emptyState.style.display = "none";
  }

  state.activeWorkout.exercises.forEach((ex, exIndex) => {
    const card = document.createElement("div");
    card.className = "log-exercise-item";
    
    let setsHTML = "";
    ex.sets.forEach((set, setIndex) => {
      setsHTML += `
        <tr class="set-row ${set.completed ? 'completed' : ''}">
          <td style="font-weight:700; color:var(--text-secondary); width: 40px;">${setIndex + 1}</td>
          <td>
            <input type="number" class="set-input" value="${set.weight}" placeholder="kg" 
                   onchange="updateActiveSetVal(${exIndex}, ${setIndex}, 'weight', this.value)">
          </td>
          <td>
            <input type="number" class="set-input" value="${set.reps}" placeholder="reps" 
                   onchange="updateActiveSetVal(${exIndex}, ${setIndex}, 'reps', this.value)">
          </td>
          <td style="width: 50px;">
            <div class="set-checkbox ${set.completed ? 'checked' : ''}" 
                 onclick="toggleSetCompleted(${exIndex}, ${setIndex})">
              <i data-lucide="check"></i>
            </div>
          </td>
          <td style="width: 40px; text-align: right;">
            <button style="background:none; border:none; color:var(--text-muted); cursor:pointer;" onclick="deleteActiveSet(${exIndex}, ${setIndex})">
              <i data-lucide="trash-2" style="width:16px; height:16px;"></i>
            </button>
          </td>
        </tr>
      `;
    });

    card.innerHTML = `
      <div class="log-exercise-header">
        <div style="display:flex; align-items:center; gap:0.5rem">
          <span class="log-exercise-title">${ex.name}</span>
          <button style="background:none; border:none; color:var(--text-muted); cursor:pointer;" onclick="openExerciseDetailsModal('${ex.id}')">
            <i data-lucide="help-circle" style="width: 16px; height: 16px;"></i>
          </button>
        </div>
        <button class="btn btn-secondary btn-icon" style="padding:0.35rem 0.6rem; font-size:0.75rem;" onclick="deleteActiveExercise(${exIndex})">
          Remove Exercise
        </button>
      </div>
      <table class="log-sets-table">
        <thead>
          <tr>
            <th>Set</th>
            <th>Weight (kg)</th>
            <th>Reps</th>
            <th>Done</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${setsHTML}
        </tbody>
      </table>
      <button class="btn btn-secondary" style="margin-top: 1rem; font-size: 0.8rem; padding: 0.4rem 0.8rem;" onclick="addSetToActiveExercise(${exIndex})">
        + Add Set
      </button>
    `;
    container.appendChild(card);
  });

  lucide.createIcons();
  updateActiveWorkoutStatsSidebar();
}

function updateActiveWorkoutStatsSidebar() {
  const exercisesCount = state.activeWorkout.exercises.length;
  let setsCount = 0;
  let volumeCount = 0;

  state.activeWorkout.exercises.forEach(ex => {
    ex.sets.forEach(set => {
      setsCount++;
      if (set.completed) {
        volumeCount += (parseFloat(set.weight || 0) * parseInt(set.reps || 0));
      }
    });
  });

  document.getElementById("active-stats-exercises").textContent = exercisesCount;
  document.getElementById("active-stats-sets").textContent = setsCount;
  document.getElementById("active-stats-volume").textContent = `${volumeCount} kg`;
}

// --- 3. EXERCISE LIBRARY VIEW ---
function populateExerciseLibrary() {
  const container = document.getElementById("exercises-grid-container");
  container.innerHTML = "";
  
  EXERCISES.forEach(ex => {
    const card = document.createElement("div");
    card.className = "card exercise-card";
    card.onclick = () => openExerciseDetailsModal(ex.id);
    
    card.innerHTML = `
      <span class="ex-card-tag tag-${ex.muscleGroup.toLowerCase()}">${ex.muscleGroup}</span>
      <h3>${ex.name}</h3>
      <p>${ex.description}</p>
      <div class="ex-meta-row">
        <span><i data-lucide="wrench" style="width:12px; height:12px; vertical-align:middle; margin-right:0.25rem;"></i>${ex.equipment.split(',')[0]}</span>
        <span>Difficulty: <strong>${ex.difficulty}</strong></span>
      </div>
    `;
    container.appendChild(card);
  });
  
  lucide.createIcons();
}

function filterExerciseLibrary() {
  const searchVal = document.getElementById("exercise-search").value.toLowerCase();
  const muscleFilter = document.getElementById("exercise-filter-muscle").value;
  const equipFilter = document.getElementById("exercise-filter-equipment").value;

  const cards = document.querySelectorAll("#exercises-grid-container .exercise-card");
  
  EXERCISES.forEach((ex, index) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchVal) || ex.description.toLowerCase().includes(searchVal);
    const matchesMuscle = muscleFilter === "" || ex.muscleGroup === muscleFilter;
    
    // Simple substring match for equipment
    const matchesEquip = equipFilter === "" || ex.equipment.toLowerCase().includes(equipFilter.toLowerCase());

    const card = cards[index];
    if (card) {
      if (matchesSearch && matchesMuscle && matchesEquip) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    }
  });
}

// --- 4. EXERCISE VIDEO VIEW ---
function renderVideosPlatform() {
  const container = document.getElementById("video-grid-container");
  container.innerHTML = "";

  // Update categories tabs save count
  const savedTab = document.querySelector(".video-categories .category-tab[data-category='Saved']");
  savedTab.textContent = `💖 Saved (${state.savedVideos.length})`;

  // Filter category
  const activeTab = document.querySelector(".video-categories .category-tab.active");
  const cat = activeTab ? activeTab.getAttribute("data-category") : "All";

  EXERCISES.forEach(ex => {
    const isSaved = state.savedVideos.includes(ex.id);
    
    // Category checks
    const matchesCat = 
      cat === "All" || 
      (cat === "Saved" && isSaved) || 
      (cat === "Strength" && ex.muscleGroup !== "Cardio") || 
      (ex.muscleGroup === cat);
      
    if (!matchesCat) return;

    const card = buildVideoCard(ex);
    container.appendChild(card);
  });

  lucide.createIcons();
}

function buildVideoCard(ex) {
  const isSaved = state.savedVideos.includes(ex.id);
  const div = document.createElement("div");
  div.className = "video-card";
  div.onclick = () => openExerciseDetailsModal(ex.id);
  
  // Extract a nice frame from Pexels video poster/thumbnail if available, else standard fallback
  // Pexels URLs support poster retrieval by replacing video file path
  const posterUrl = "https://images.pexels.com/photos/1552244/pexels-photo-1552244.jpeg?auto=compress&cs=tinysrgb&w=500";

  div.innerHTML = `
    <div class="video-card-thumbnail-container">
      <img src="${posterUrl}" class="video-card-thumbnail" alt="${ex.name}">
      <div class="video-card-overlay">
        <span class="video-card-category">${ex.muscleGroup}</span>
        <div class="video-play-btn"><i data-lucide="play" style="fill:currentColor; margin-left: 2px;"></i></div>
        <span class="video-duration">0:15 Loop</span>
      </div>
    </div>
    <div style="padding: 1rem; background-color: var(--bg-card); display:flex; flex-direction:column; gap:0.25rem;">
      <span class="video-card-title">${ex.name}</span>
      <span style="font-size:0.75rem; color:var(--text-secondary)">Demonstration & form tips</span>
    </div>
    <div class="video-card-actions" onclick="event.stopPropagation()">
      <button class="video-action-btn like-btn" onclick="toggleLikeVideo('${ex.id}', this)">
        <i data-lucide="heart" style="width:16px; height:16px;"></i> Like
      </button>
      <button class="video-action-btn save-btn ${isSaved ? 'active' : ''}" onclick="toggleSaveVideo('${ex.id}')">
        <i data-lucide="bookmark" style="width:16px; height:16px;"></i> ${isSaved ? 'Saved' : 'Save'}
      </button>
    </div>
  `;
  return div;
}

function filterVideoCategory(category) {
  const tabs = document.querySelectorAll(".video-categories .category-tab");
  tabs.forEach(t => {
    if (t.getAttribute("data-category") === category) {
      t.classList.add("active");
    } else {
      t.classList.remove("active");
    }
  });

  renderVideosPlatform();
}

function toggleLikeVideo(id, btnEl) {
  btnEl.classList.toggle("active");
  if (btnEl.classList.contains("active")) {
    btnEl.style.color = "var(--neon-red)";
    showToast("Liked video tutorial!", "red");
  } else {
    btnEl.style.color = "var(--text-secondary)";
  }
}

function toggleSaveVideo(id) {
  const idx = state.savedVideos.indexOf(id);
  if (idx > -1) {
    state.savedVideos.splice(idx, 1);
    showToast("Removed video from saved list.", "cyan");
  } else {
    state.savedVideos.push(id);
    showToast("Saved video tutorial!", "cyan");
  }
  saveStateToLocalStorage();
  renderVideosPlatform();
}

// --- 5. WORKOUT PROGRAMS VIEW ---
function switchProgramTab(tab) {
  const readyBtn = document.getElementById("btn-prog-ready");
  const customBtn = document.getElementById("btn-prog-custom");
  const readyView = document.getElementById("programs-ready-tab");
  const customView = document.getElementById("programs-custom-tab");

  if (tab === "ready") {
    readyBtn.classList.add("btn-primary");
    customBtn.classList.remove("btn-primary");
    readyView.style.display = "grid";
    customView.style.display = "none";
    renderProgramsList();
  } else {
    customBtn.classList.add("btn-primary");
    readyBtn.classList.remove("btn-primary");
    readyView.style.display = "none";
    customView.style.display = "block";
    resetCustomProgramBuilder();
  }
}

function renderProgramsList() {
  const container = document.getElementById("programs-ready-tab");
  container.innerHTML = "";

  // Combine ready-made and custom programs
  const allProgs = [...READY_PROGRAMS, ...state.customPrograms];

  allProgs.forEach(prog => {
    const card = document.createElement("div");
    card.className = "card program-card";
    
    // Build list of exercise names
    let exListHTML = "";
    prog.exercises.slice(0, 4).forEach(id => {
      const dbEx = EXERCISES.find(e => e.id === id);
      if (dbEx) {
        exListHTML += `<div class="program-exercise-row"><span>${dbEx.name}</span><span style="color:var(--text-muted)">Sets: 3-4</span></div>`;
      }
    });
    
    if (prog.exercises.length > 4) {
      exListHTML += `<div style="font-size:0.75rem; color:var(--text-muted); text-align:center; margin-top:0.5rem;">+ ${prog.exercises.length - 4} more exercises</div>`;
    }

    card.innerHTML = `
      <div class="program-card-header">
        <h3>${prog.name}</h3>
        <span style="background:rgba(204,255,0,0.08); color:var(--neon-lime); font-size:0.75rem; padding:0.25rem 0.5rem; border-radius:4px; font-weight:700;">
          ${prog.difficulty || 'Custom'}
        </span>
      </div>
      <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.4; margin-bottom:1rem; flex-grow:1;">
        ${prog.description}
      </p>
      <div class="program-meta">
        <span><i data-lucide="calendar" style="width:14px; height:14px; vertical-align:middle; margin-right:0.25rem;"></i>${prog.days} Days/Week</span>
        <span><i data-lucide="dumbbell" style="width:14px; height:14px; vertical-align:middle; margin-right:0.25rem;"></i>${prog.exercises.length} Exercises</span>
      </div>
      <div class="program-exercises-list">
        ${exListHTML}
      </div>
      <button class="btn btn-primary" style="width: 100%; margin-top:auto;" onclick="startProgramWorkout('${prog.id}')">
        Start Program Workout
      </button>
    `;
    container.appendChild(card);
  });

  lucide.createIcons();
}

function startProgramWorkout(progId) {
  // Check if active workout is already running
  if (state.activeWorkout.isActive) {
    if (!confirm("An active workout is already in progress. Do you want to cancel it and start this program instead?")) {
      return;
    }
    cancelWorkoutSilent();
  }

  // Find program
  const allProgs = [...READY_PROGRAMS, ...state.customPrograms];
  const prog = allProgs.find(p => p.id === progId);
  if (!prog) return;

  // Initialize active workout from program
  state.activeWorkout = {
    isActive: true,
    name: `${prog.name} - Day Session`,
    programName: prog.name,
    startTime: new Date().toISOString(),
    durationSeconds: 0,
    exercises: prog.exercises.map(id => {
      const dbEx = EXERCISES.find(e => e.id === id);
      return {
        id: id,
        name: dbEx ? dbEx.name : "Exercise",
        sets: [
          { weight: 60, reps: 10, completed: false },
          { weight: 60, reps: 10, completed: false },
          { weight: 60, reps: 10, completed: false }
        ]
      };
    })
  };

  saveStateToLocalStorage();
  resumeActiveWorkoutTimerIfRunning();
  
  // Switch to tracker tab
  switchTab("tracker");
  showToast(`Started program: ${prog.name}`, "lime");
}

// --- Custom program builder form control ---
function resetCustomProgramBuilder() {
  document.getElementById("custom-program-form").reset();
  const list = document.getElementById("custom-prog-exercises-list");
  list.innerHTML = "";
  // add 2 initial rows
  addExerciseToCustomProgramBuilder();
  addExerciseToCustomProgramBuilder();
}

function addExerciseToCustomProgramBuilder() {
  const list = document.getElementById("custom-prog-exercises-list");
  const row = document.createElement("div");
  row.className = "custom-prog-exercise-row-item";
  row.style.display = "flex";
  row.style.gap = "0.5rem";
  
  let options = "";
  EXERCISES.forEach(ex => {
    options += `<option value="${ex.id}">${ex.name} (${ex.muscleGroup})</option>`;
  });

  row.innerHTML = `
    <select style="flex:1; background-color: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding: 0.5rem; color: #fff;">
      ${options}
    </select>
    <button type="button" class="btn btn-danger btn-icon" style="padding:0.5rem" onclick="this.parentElement.remove()">
      <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
    </button>
  `;
  list.appendChild(row);
  lucide.createIcons();
}

function saveCustomProgram(event) {
  event.preventDefault();
  const name = document.getElementById("prog-name").value;
  const description = document.getElementById("prog-description").value;
  const days = document.getElementById("prog-days").value;
  
  const selectElements = document.querySelectorAll("#custom-prog-exercises-list select");
  const exercises = Array.from(selectElements).map(sel => sel.value);

  if (exercises.length === 0) {
    alert("Please add at least one exercise row to save this program.");
    return;
  }

  const newProg = {
    id: "custom-" + Date.now(),
    name,
    description: description || "No description provided.",
    days: parseInt(days),
    difficulty: "Custom",
    exercises
  };

  state.customPrograms.push(newProg);
  saveStateToLocalStorage();
  showToast("Saved custom program!", "lime");
  switchProgramTab("ready");
}

// --- 6. PROGRESS / ANALYTICS VIEW ---
function initProgressCharts() {
  const weightCtx = document.getElementById("weightChart").getContext("2d");
  const volumeCtx = document.getElementById("volumeChart").getContext("2d");

  // Destory existing charts to prevent canvas re-use bugs
  if (weightChartInstance) weightChartInstance.destroy();
  if (volumeChartInstance) volumeChartInstance.destroy();

  // Sort weight logs chronological
  const sortedWeight = [...state.weightLogs].sort((a,b) => new Date(a.date) - new Date(b.date));
  const weightLabels = sortedWeight.map(w => new Date(w.date).toLocaleDateString(undefined, {month: "short", day: "numeric"}));
  const weightData = sortedWeight.map(w => w.weight);

  // Setup Weight Chart
  weightChartInstance = new Chart(weightCtx, {
    type: "line",
    data: {
      labels: weightLabels,
      datasets: [{
        label: "Body Weight (kg)",
        data: weightData,
        borderColor: "#ccff00",
        backgroundColor: "rgba(204, 255, 0, 0.05)",
        fill: true,
        tension: 0.35,
        borderWidth: 3,
        pointBackgroundColor: "#ccff00",
        pointBorderColor: "#08080a",
        pointBorderWidth: 2,
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { grid: { color: "rgba(255,255,255,0.03)" }, ticks: { color: "#9094a6" } },
        y: { grid: { color: "rgba(255,255,255,0.03)" }, ticks: { color: "#9094a6" } }
      }
    }
  });

  // Calculate workout volumes (last 6 completed workouts)
  const sortedWorkouts = [...state.workouts].sort((a,b) => new Date(a.startTime) - new Date(b.startTime)).slice(-6);
  const volumeLabels = sortedWorkouts.map(w => w.name.length > 15 ? w.name.substring(0, 12) + "..." : w.name);
  const volumeData = sortedWorkouts.map(w => w.totalVolume);

  // Setup Volume Chart
  volumeChartInstance = new Chart(volumeCtx, {
    type: "bar",
    data: {
      labels: volumeLabels.length > 0 ? volumeLabels : ["No Logs"],
      datasets: [{
        label: "Volume (kg)",
        data: volumeData.length > 0 ? volumeData : [0],
        backgroundColor: "rgba(0, 240, 255, 0.4)",
        borderColor: "#00f0ff",
        borderWidth: 2,
        borderRadius: 6,
        hoverBackgroundColor: "#00f0ff"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#9094a6" } },
        y: { grid: { color: "rgba(255,255,255,0.03)" }, ticks: { color: "#9094a6" } }
      }
    }
  });

  // Calculate and sync BMI
  calculateAndRenderBMI();
}

function calculateAndRenderBMI() {
  const heightM = state.profile.height / 100;
  const weightKg = state.profile.weight;
  
  if (heightM <= 0 || weightKg <= 0) return;
  const bmi = (weightKg / (heightM * heightM)).toFixed(1);
  
  document.getElementById("bmi-display-val").textContent = bmi;
  
  let status = "Normal Weight";
  let color = "var(--neon-lime)";
  
  if (bmi < 18.5) {
    status = "Underweight";
    color = "var(--neon-cyan)";
  } else if (bmi >= 25 && bmi < 29.9) {
    status = "Overweight";
    color = "var(--neon-orange)";
  } else if (bmi >= 30) {
    status = "Obese";
    color = "var(--neon-red)";
  }

  const statEl = document.getElementById("bmi-display-status");
  statEl.textContent = status;
  statEl.style.color = color;
}

function logNewWeight(event) {
  event.preventDefault();
  const inputVal = parseFloat(document.getElementById("log-weight-val").value);
  if (!inputVal || inputVal <= 0) return;

  const dateStr = getTodayDateString();
  
  // Update in history or add
  const existingIndex = state.weightLogs.findIndex(w => w.date === dateStr);
  if (existingIndex > -1) {
    state.weightLogs[existingIndex].weight = inputVal;
  } else {
    state.weightLogs.push({ date: dateStr, weight: inputVal });
  }

  // Sync profile current weight
  state.profile.weight = inputVal;
  
  // Sync goal current value if applicable
  const weightGoal = state.goals.find(g => g.id === "goal-weight");
  if (weightGoal) {
    weightGoal.current = inputVal;
    if (state.profile.goal === "Lose Weight" && inputVal <= weightGoal.target) weightGoal.completed = true;
    if (state.profile.goal === "Gain Muscle" && inputVal >= weightGoal.target) weightGoal.completed = true;
  }

  saveStateToLocalStorage();
  showToast(`Logged weight: ${inputVal} kg`, "lime");
  document.getElementById("log-weight-val").value = "";
  
  initProgressCharts();
  renderWeightHistoryList();
  syncProfileUI();
}

function renderWeightHistoryList() {
  const container = document.getElementById("weight-history-rows-container");
  container.innerHTML = "";
  
  // sort reverse chronological
  const sorted = [...state.weightLogs].sort((a,b) => new Date(b.date) - new Date(a.date));
  sorted.forEach(log => {
    const row = document.createElement("div");
    row.className = "weight-log-row";
    row.innerHTML = `
      <span>${new Date(log.date).toLocaleDateString(undefined, {month: "short", day: "numeric", year: "numeric"})}</span>
      <strong style="color:var(--neon-lime)">${log.weight} kg</strong>
    `;
    container.appendChild(row);
  });
}

// --- 7. NUTRITION VIEW ---
function renderNutritionView() {
  const todayStr = getTodayDateString();
  const nutLog = state.nutrition[todayStr] || { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0, foods: [] };

  // Calorie ring
  const calPercent = Math.min((nutLog.calories / state.profile.calorieTarget) * 100, 100);
  const circle = document.getElementById("nutrition-calorie-circle");
  // Circumference of r=70 is 2 * PI * 70 = 440
  const offset = 440 - (440 * calPercent) / 100;
  circle.style.strokeDashoffset = offset;
  document.getElementById("nutri-cals-logged").textContent = Math.round(nutLog.calories);
  document.getElementById("nutri-cals-target").textContent = state.profile.calorieTarget;

  // Status text
  document.getElementById("nutri-status-text").innerHTML = 
    nutLog.calories >= state.profile.calorieTarget 
    ? `<strong style="color:var(--neon-lime)">Goal Reached!</strong> You logged ${Math.round(nutLog.calories)} calories.`
    : `You need <strong style="color:#fff">${Math.round(state.profile.calorieTarget - nutLog.calories)}</strong> more kcal today.`;

  // Macro labels & bars
  document.getElementById("nutri-prot-vals").textContent = `${Math.round(nutLog.protein)}g / 150g`;
  document.getElementById("bar-protein").style.width = `${Math.min((nutLog.protein / 150) * 100, 100)}%`;

  document.getElementById("nutri-carb-vals").textContent = `${Math.round(nutLog.carbs)}g / 200g`;
  document.getElementById("bar-carbs").style.width = `${Math.min((nutLog.carbs / 200) * 100, 100)}%`;

  document.getElementById("nutri-fat-vals").textContent = `${Math.round(nutLog.fats)}g / 65g`;
  document.getElementById("bar-fats").style.width = `${Math.min((nutLog.fats / 65) * 100, 100)}%`;

  // Water text
  document.getElementById("nutri-water-display").textContent = `${nutLog.water} ml`;
  document.getElementById("nutri-water-target").textContent = state.profile.waterTarget;

  // Hydration Water Grid (8 cups representing 250ml each to reach 2L)
  const cupsContainer = document.getElementById("water-cups-grid");
  cupsContainer.innerHTML = "";
  const totalCups = 8;
  const activeCups = Math.min(Math.floor(nutLog.water / 250), totalCups);

  for (let i = 0; i < totalCups; i++) {
    const btn = document.createElement("button");
    btn.className = `water-cup-btn ${i < activeCups ? 'filled' : ''}`;
    btn.onclick = () => toggleWaterCup(i);
    btn.innerHTML = `
      <i data-lucide="glass-water" style="width: 20px; height: 20px;"></i>
      <span style="font-size:0.65rem; margin-top:0.25rem;">250ml</span>
    `;
    cupsContainer.appendChild(btn);
  }

  // Food history logs list
  const historyList = document.getElementById("food-logs-container");
  historyList.innerHTML = "";
  if (!nutLog.foods || nutLog.foods.length === 0) {
    historyList.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 1.5rem 0;">No foods logged today.</p>`;
  } else {
    nutLog.foods.forEach((food, idx) => {
      const item = document.createElement("div");
      item.className = "food-history-item";
      item.innerHTML = `
        <div class="food-history-info">
          <span class="food-history-name">${food.name}</span>
          <span class="food-history-macros">P: ${food.protein}g | C: ${food.carbs}g | F: ${food.fats}g</span>
        </div>
        <div style="display:flex; align-items:center; gap:0.75rem">
          <span class="food-history-cals">${food.calories} kcal</span>
          <button style="background:none; border:none; color:var(--text-muted); cursor:pointer;" onclick="deleteFoodLog(${idx})">
            <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
          </button>
        </div>
      `;
      historyList.appendChild(item);
    });
  }

  lucide.createIcons();
}

function logNewFood(event) {
  event.preventDefault();
  const name = document.getElementById("food-name").value;
  const calories = parseInt(document.getElementById("food-cals").value);
  const protein = parseInt(document.getElementById("food-prot").value) || 0;
  const carbs = parseInt(document.getElementById("food-carbs").value) || 0;
  const fats = parseInt(document.getElementById("food-fats").value) || 0;

  const todayStr = getTodayDateString();
  if (!state.nutrition[todayStr]) {
    state.nutrition[todayStr] = { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0, foods: [] };
  }

  const log = state.nutrition[todayStr];
  log.foods.push({ name, calories, protein, carbs, fats });
  log.calories += calories;
  log.protein += protein;
  log.carbs += carbs;
  log.fats += fats;

  saveStateToLocalStorage();
  showToast(`Food logged: ${name}`, "lime");
  
  // reset forms
  document.getElementById("food-name").value = "";
  document.getElementById("food-cals").value = "";
  document.getElementById("food-prot").value = "";
  document.getElementById("food-carbs").value = "";
  document.getElementById("food-fats").value = "";

  renderNutritionView();
}

function deleteFoodLog(index) {
  const todayStr = getTodayDateString();
  const log = state.nutrition[todayStr];
  if (!log) return;

  const food = log.foods[index];
  if (food) {
    log.calories -= food.calories;
    log.protein -= food.protein;
    log.carbs -= food.carbs;
    log.fats -= food.fats;
    log.foods.splice(index, 1);
  }

  saveStateToLocalStorage();
  showToast("Food log removed.", "cyan");
  renderNutritionView();
}

function addWaterMl(amount) {
  const todayStr = getTodayDateString();
  if (!state.nutrition[todayStr]) {
    state.nutrition[todayStr] = { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0, foods: [] };
  }
  
  state.nutrition[todayStr].water += amount;
  
  // Sync goal hydration
  const hydGoal = state.goals.find(g => g.id === "goal-hydration");
  if (hydGoal) {
    hydGoal.current = state.nutrition[todayStr].water;
    if (hydGoal.current >= hydGoal.target) hydGoal.completed = true;
  }

  saveStateToLocalStorage();
  showToast(`Logged ${amount}ml water!`, "cyan");
  renderNutritionView();
}

function toggleWaterCup(cupIndex) {
  const todayStr = getTodayDateString();
  const currentWater = state.nutrition[todayStr]?.water || 0;
  const currentCups = Math.floor(currentWater / 250);

  // If tapping a cup that is filled, empty to that index, else fill up to it
  let targetCups = cupIndex + 1;
  if (cupIndex < currentCups) {
    targetCups = cupIndex; // empty cup and above
  }

  const targetWater = targetCups * 250;
  
  if (!state.nutrition[todayStr]) {
    state.nutrition[todayStr] = { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0, foods: [] };
  }
  state.nutrition[todayStr].water = targetWater;

  // Sync hydration goal
  const hydGoal = state.goals.find(g => g.id === "goal-hydration");
  if (hydGoal) {
    hydGoal.current = targetWater;
    hydGoal.completed = targetWater >= hydGoal.target;
  }

  saveStateToLocalStorage();
  renderNutritionView();
}

function resetWaterIntake() {
  const todayStr = getTodayDateString();
  if (state.nutrition[todayStr]) {
    state.nutrition[todayStr].water = 0;
  }
  const hydGoal = state.goals.find(g => g.id === "goal-hydration");
  if (hydGoal) {
    hydGoal.current = 0;
    hydGoal.completed = false;
  }
  saveStateToLocalStorage();
  showToast("Hydration logs reset.", "cyan");
  renderNutritionView();
}

// --- 8. AI fitness coach chat logic ---
function syncCoachMetadata() {
  document.querySelectorAll(".user-height-display").forEach(el => el.textContent = `${state.profile.height} cm`);
  document.querySelectorAll(".user-weight-display").forEach(el => el.textContent = `${state.profile.weight} kg`);
  document.getElementById("coach-goal-display").textContent = state.profile.goal;
  document.getElementById("coach-level-display").textContent = state.profile.activityLevel;
}

function submitAiChatForm(event) {
  event.preventDefault();
  const inputEl = document.getElementById("ai-chat-input");
  const query = inputEl.value.trim();
  if (!query) return;

  askAiQuestion(query);
  inputEl.value = "";
}

function askAiQuestion(query) {
  const chatHistory = document.getElementById("chat-history-container");
  
  // Append User message
  const userDiv = document.createElement("div");
  userDiv.className = "chat-message user";
  userDiv.textContent = query;
  chatHistory.appendChild(userDiv);

  // Auto scroll
  chatHistory.scrollTop = chatHistory.scrollHeight;

  // Typing indicator simulation
  const aiTypingDiv = document.createElement("div");
  aiTypingDiv.className = "chat-message ai";
  aiTypingDiv.innerHTML = `<span style="font-style:italic;color:var(--text-muted)">AI Coach is typing...</span>`;
  chatHistory.appendChild(aiTypingDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;

  // Response mapping
  setTimeout(() => {
    aiTypingDiv.remove();
    const reply = getAiCoachResponse(query);
    const aiDiv = document.createElement("div");
    aiDiv.className = "chat-message ai";
    aiDiv.innerHTML = reply;
    chatHistory.appendChild(aiDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }, 1200);
}

function getAiCoachResponse(query) {
  const q = query.toLowerCase();
  
  // 1. Context variables
  const name = state.profile.name.split(" ")[0];
  const goal = state.profile.goal;
  const wt = state.profile.weight;
  
  // 2. Specific triggers
  if (q.includes("30 minutes") || q.includes("30-min") || q.includes("time today")) {
    return `
      Hi ${name}, based on your goal to <strong>${goal}</strong>, here is a highly efficient <strong>30-minute metabolic conditioning (HIIT) circuit</strong>:
      <br><br>
      <strong>Warmup (3 mins):</strong> Jumping jacks, shoulder rolls, light air squats.
      <br><strong>Main Circuit (22 mins) - Perform 4 Rounds:</strong>
      <ul>
        <li>1. Bodyweight Air Squats: 45 secs active / 15 secs rest</li>
        <li>2. Push-ups: 45 secs active / 15 secs rest</li>
        <li>3. Russian Twists (core): 45 secs active / 15 secs rest</li>
        <li>4. Burpees or Jump Rope: 45 secs active / 15 secs rest</li>
      </ul>
      <strong>Cooldown (5 mins):</strong> Hamstring and chest stretches.
      <br><br>
      <button class="btn btn-primary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; margin-top: 0.5rem;" onclick="loadCustomAiWorkout('30-Min HIIT Circuit', ['push-up', 'barbell-squat', 'russian-twist', 'burpee'])">
        Load 30-Min Circuit
      </button>
    `;
  }
  
  if (q.includes("squat") || q.includes("bench press") || q.includes("form")) {
    return `
      Form and joint safety are crucial, especially at ${wt} kg bodyweight. Here are 3 rules for barbell compound movements:
      <br><br>
      <strong>1. Bracing the core:</strong> Don't just suck in your stomach. Imagine you are about to get punched in the gut—brace out.
      <br><strong>2. Path Control:</strong> Keep the weight bar path straight and perpendicular to the floor. Don't tilt.
      <br><strong>3. Joints alignment:</strong> For Squats, push hips back first, and don't let knees cave in. For Bench Press, keep elbows tucked at a 45-degree angle.
      <br><br>
      You can look up the safety instruction pages and video demonstrations directly in our <strong>Library</strong> tab!
    `;
  }

  if (q.includes("recovery") || q.includes("rest day") || q.includes("sore")) {
    return `
      Recovery is when muscle synthesis actually happens, ${name}. Here is a recovery blueprint for you today:
      <br><br>
      <ul>
        <li><strong>Mobility:</strong> 15 minutes of dynamic stretching focusing on tight areas (hips, chest).</li>
        <li><strong>Nutrition:</strong> Keep protein high (${Math.round(wt * 2)}g target) to repair muscle tissue.</li>
        <li><strong>Hydration:</strong> Aim for at least 2500ml today to flush out cellular metabolic waste.</li>
      </ul>
      <br>
      <button class="btn btn-primary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; margin-top: 0.5rem;" onclick="loadCustomAiWorkout('Mobility & Active Recovery', ['plank', 'treadmill-run'])">
        Load Recovery Workout
      </button>
    `;
  }

  if (q.includes("meal") || q.includes("eat") || q.includes("diet") || q.includes("nutrition")) {
    return `
      Since your target is <strong>${goal}</strong> and you weigh ${wt} kg, here is your customized macro-split:
      <br><br>
      <ul>
        <li><strong>Calorie Ceiling:</strong> ${state.profile.calorieTarget} kcal</li>
        <li><strong>Protein Goal:</strong> 150g (30% of total cals) - key for tissue building.</li>
        <li><strong>Carbs Goal:</strong> 200g (40% of total cals) - primary training fuel.</li>
        <li><strong>Fats Goal:</strong> 65g (30% of total cals) - crucial for hormone synthesis.</li>
      </ul>
      <br>
      <em>Meal idea:</em> Grilled chicken (150g), brown rice (1 cup), broccoli (half plate), and half avocado for healthy fats. Log this in the <strong>Nutrition</strong> tab!
    `;
  }

  return `
    Interesting question, ${name}! Based on your current weight of ${wt} kg and goal (<strong>${goal}</strong>), I recommend focusing on consistency. 
    <br><br>
    Try to log at least 3 compound workouts per week, maintain your hydration target, and track your metrics. Let me know if you want a custom routine recommendation!
  `;
}

function loadCustomAiWorkout(name, exerciseIds) {
  if (state.activeWorkout.isActive) {
    if (!confirm("A workout session is currently active. Stop and load this AI routine instead?")) return;
    cancelWorkoutSilent();
  }

  state.activeWorkout = {
    isActive: true,
    name: name,
    programName: "AI Recommended",
    startTime: new Date().toISOString(),
    durationSeconds: 0,
    exercises: exerciseIds.map(id => {
      const dbEx = EXERCISES.find(e => e.id === id);
      return {
        id: id,
        name: dbEx ? dbEx.name : "Exercise",
        sets: [
          { weight: 45, reps: 12, completed: false },
          { weight: 45, reps: 12, completed: false }
        ]
      };
    })
  };

  saveStateToLocalStorage();
  resumeActiveWorkoutTimerIfRunning();
  switchTab("tracker");
  showToast(`Loaded: ${name}`, "lime");
}

// --- 9. PROFILE PAGE ---
function populateProfileFormFields() {
  document.getElementById("prof-name").value = state.profile.name;
  document.getElementById("prof-gender").value = state.profile.gender;
  document.getElementById("prof-age").value = state.profile.age;
  document.getElementById("prof-height").value = state.profile.height;
  document.getElementById("prof-weight").value = state.profile.weight;
  document.getElementById("prof-goal").value = state.profile.goal;
  document.getElementById("prof-activity").value = state.profile.activityLevel;
  document.getElementById("prof-cal-target").value = state.profile.calorieTarget;
}

function saveUserProfile(event) {
  event.preventDefault();
  
  state.profile.name = document.getElementById("prof-name").value;
  state.profile.gender = document.getElementById("prof-gender").value;
  state.profile.age = parseInt(document.getElementById("prof-age").value);
  state.profile.height = parseInt(document.getElementById("prof-height").value);
  state.profile.weight = parseFloat(document.getElementById("prof-weight").value);
  state.profile.goal = document.getElementById("prof-goal").value;
  state.profile.activityLevel = document.getElementById("prof-activity").value;
  state.profile.calorieTarget = parseInt(document.getElementById("prof-cal-target").value);

  // Sync latest weight in log if not present today
  const todayStr = getTodayDateString();
  const existingIndex = state.weightLogs.findIndex(w => w.date === todayStr);
  if (existingIndex > -1) {
    state.weightLogs[existingIndex].weight = state.profile.weight;
  } else {
    state.weightLogs.push({ date: todayStr, weight: state.profile.weight });
  }

  saveStateToLocalStorage();
  syncProfileUI();
  showToast("Profile settings updated!", "lime");
  switchTab("dashboard");
}

function syncProfileUI() {
  document.getElementById("user-display-name").textContent = state.profile.name;
  document.getElementById("avatar-letter").textContent = state.profile.name.charAt(0).toUpperCase();
  syncCoachMetadata();
}

// ==============================================
// ACTIVE WORKOUT INTERACTIVE LOGIC
// ==============================================
function startNewEmptyWorkout() {
  if (state.activeWorkout.isActive) {
    switchTab("tracker");
    return;
  }

  state.activeWorkout = {
    isActive: true,
    name: "Custom Workout Session",
    programName: "Custom Routine",
    startTime: new Date().toISOString(),
    durationSeconds: 0,
    exercises: []
  };

  saveStateToLocalStorage();
  resumeActiveWorkoutTimerIfRunning();
  switchTab("tracker");
  showToast("Started empty workout session!", "lime");
}

function resumeActiveWorkoutTimerIfRunning() {
  if (activeWorkoutTimerInterval) clearInterval(activeWorkoutTimerInterval);

  if (state.activeWorkout.isActive) {
    // Calculate elapsed duration in case of page refresh
    const elapsed = Math.floor((new Date() - new Date(state.activeWorkout.startTime)) / 1000);
    state.activeWorkout.durationSeconds = elapsed > 0 ? elapsed : 0;
    
    activeWorkoutTimerInterval = setInterval(() => {
      state.activeWorkout.durationSeconds++;
      
      // Update timer displays across views
      const timeStr = formatTime(state.activeWorkout.durationSeconds);
      const clockEl = document.getElementById("active-workout-clock");
      if (clockEl) clockEl.textContent = timeStr;
      
      const dashDurEl = document.getElementById("dash-active-workout-duration");
      if (dashDurEl) dashDurEl.textContent = `Duration: ${timeStr}`;
    }, 1000);
  }
}

function updateActiveSetVal(exIndex, setIndex, field, value) {
  const ex = state.activeWorkout.exercises[exIndex];
  if (ex && ex.sets[setIndex]) {
    ex.sets[setIndex][field] = parseFloat(value) || 0;
    saveStateToLocalStorage();
    updateActiveWorkoutStatsSidebar();
  }
}

function addSetToActiveExercise(exIndex) {
  const ex = state.activeWorkout.exercises[exIndex];
  if (ex) {
    // Duplicate parameters of last set if available, else standard values
    let lastWeight = 60;
    let lastReps = 10;
    if (ex.sets.length > 0) {
      lastWeight = ex.sets[ex.sets.length - 1].weight;
      lastReps = ex.sets[ex.sets.length - 1].reps;
    }

    ex.sets.push({ weight: lastWeight, reps: lastReps, completed: false });
    saveStateToLocalStorage();
    renderActiveWorkoutPanel();
  }
}

function deleteActiveSet(exIndex, setIndex) {
  const ex = state.activeWorkout.exercises[exIndex];
  if (ex) {
    ex.sets.splice(setIndex, 1);
    saveStateToLocalStorage();
    renderActiveWorkoutPanel();
  }
}

function deleteActiveExercise(exIndex) {
  state.activeWorkout.exercises.splice(exIndex, 1);
  saveStateToLocalStorage();
  renderActiveWorkoutPanel();
}

function toggleSetCompleted(exIndex, setIndex) {
  const ex = state.activeWorkout.exercises[exIndex];
  if (ex && ex.sets[setIndex]) {
    const newVal = !ex.sets[setIndex].completed;
    ex.sets[setIndex].completed = newVal;
    saveStateToLocalStorage();
    renderActiveWorkoutPanel();

    // Trigger Rest Timer Countdown if checked completed
    if (newVal) {
      triggerRestTimer(60, ex.name);
    }
  }
}

// Workout Exercise Picker modal triggers
function openWorkoutExercisePicker() {
  document.getElementById("picker-search").value = "";
  filterPickerList();
  document.getElementById("workout-picker-modal").classList.add("active");
}

function closeWorkoutExercisePicker() {
  document.getElementById("workout-picker-modal").classList.remove("active");
}

function filterPickerList() {
  const search = document.getElementById("picker-search").value.toLowerCase();
  const list = document.getElementById("picker-exercises-list");
  list.innerHTML = "";

  EXERCISES.forEach(ex => {
    if (ex.name.toLowerCase().includes(search)) {
      const btn = document.createElement("button");
      btn.className = "btn btn-secondary";
      btn.style.textAlign = "left";
      btn.style.width = "100%";
      btn.style.justifyContent = "space-between";
      btn.onclick = () => selectExerciseForActiveWorkout(ex.id);
      btn.innerHTML = `
        <span>${ex.name}</span>
        <span style="font-size:0.75rem; color:var(--text-muted)">${ex.muscleGroup}</span>
      `;
      list.appendChild(btn);
    }
  });
}

function selectExerciseForActiveWorkout(id) {
  const dbEx = EXERCISES.find(e => e.id === id);
  if (!dbEx) return;

  state.activeWorkout.exercises.push({
    id: id,
    name: dbEx.name,
    sets: [
      { weight: 60, reps: 10, completed: false },
      { weight: 60, reps: 10, completed: false }
    ]
  });

  saveStateToLocalStorage();
  closeWorkoutExercisePicker();
  renderActiveWorkoutPanel();
  showToast(`Added: ${dbEx.name}`, "lime");
}

// REST TIMER HANDLERS
function triggerRestTimer(seconds, nextExLabel) {
  if (restTimerInterval) clearInterval(restTimerInterval);
  
  restTimeTotal = seconds;
  restTimeRemaining = seconds;

  document.getElementById("rest-clock-val").textContent = restTimeRemaining;
  document.getElementById("rest-next-exercise-label").textContent = `Next Set: ${nextExLabel}`;
  
  // Reset dashoffset circle path r=100 circumference=628
  const path = document.getElementById("rest-timer-progress");
  path.style.strokeDashoffset = 0;

  document.getElementById("rest-timer-overlay").classList.add("active");

  restTimerInterval = setInterval(() => {
    restTimeRemaining--;
    document.getElementById("rest-clock-val").textContent = restTimeRemaining;

    // update progress circle path
    const offset = 628 - (628 * restTimeRemaining) / restTimeTotal;
    path.style.strokeDashoffset = offset;

    if (restTimeRemaining <= 0) {
      clearInterval(restTimerInterval);
      playRestAlertSound();
      closeRestOverlay();
    }
  }, 1000);
}

function addRestTime(seconds) {
  restTimeRemaining += seconds;
  restTimeTotal += seconds;
  document.getElementById("rest-clock-val").textContent = restTimeRemaining;
}

function skipRestTimer() {
  clearInterval(restTimerInterval);
  closeRestOverlay();
}

function closeRestOverlay() {
  document.getElementById("rest-timer-overlay").classList.remove("active");
}

function playRestAlertSound() {
  const audio = document.getElementById("timer-alert-sound");
  if (audio) {
    audio.play().catch(e => console.log("Audio play blocked by browser policy"));
  }
}

// FINISHING / CANCELING WORKOUT
function cancelWorkout() {
  if (confirm("Are you sure you want to cancel this active workout? All logged sets for this session will be lost.")) {
    cancelWorkoutSilent();
    showToast("Workout session discarded.", "red");
  }
}

function cancelWorkoutSilent() {
  if (activeWorkoutTimerInterval) clearInterval(activeWorkoutTimerInterval);
  state.activeWorkout = {
    isActive: false,
    name: "",
    programName: "",
    startTime: null,
    durationSeconds: 0,
    exercises: []
  };
  saveStateToLocalStorage();
  renderTrackerView();
}

function finishWorkout() {
  const active = state.activeWorkout;
  
  // Validate if there are logged sets completed
  let totalSets = 0;
  let totalVolume = 0;
  
  active.exercises.forEach(ex => {
    ex.sets.forEach(set => {
      if (set.completed) {
        totalSets++;
        totalVolume += (set.weight * set.reps);
      }
    });
  });

  if (totalSets === 0) {
    alert("Please complete/check at least one set to finish and save your workout.");
    return;
  }

  // Create logged entry
  const log = {
    id: "workout-" + Date.now(),
    name: active.name || "Custom Workout",
    programName: active.programName,
    startTime: active.startTime,
    endTime: new Date().toISOString(),
    duration: active.durationSeconds,
    totalVolume,
    totalSets,
    dateStr: getTodayDateString(),
    exercises: active.exercises
  };

  state.workouts.push(log);

  // Sync consistency goal
  const freqGoal = state.goals.find(g => g.id === "goal-frequency");
  if (freqGoal) {
    freqGoal.current = getWeeklyWorkoutCount();
    if (freqGoal.current >= freqGoal.target) freqGoal.completed = true;
  }

  // Clear active workout state
  if (activeWorkoutTimerInterval) clearInterval(activeWorkoutTimerInterval);
  state.activeWorkout = {
    isActive: false,
    name: "",
    programName: "",
    startTime: null,
    durationSeconds: 0,
    exercises: []
  };

  saveStateToLocalStorage();
  showToast("Workout saved! Phenomenal job! 🎉", "lime");
  
  // Switch to dashboard
  switchTab("dashboard");
}

// ==============================================
// MODAL AND DETAIL VIEW SYSTEM
// ==============================================
function openExerciseDetailsModal(id) {
  const ex = EXERCISES.find(e => e.id === id);
  if (!ex) return;

  document.getElementById("modal-exercise-name").textContent = ex.name;
  document.getElementById("modal-description").textContent = ex.description;
  document.getElementById("modal-safety").textContent = ex.safetyInstructions;

  // Render tags
  const tags = document.getElementById("modal-tags-container");
  tags.innerHTML = `
    <span class="ex-card-tag tag-${ex.muscleGroup.toLowerCase()}">${ex.muscleGroup}</span>
    <span class="ex-card-tag" style="background:rgba(255,255,255,0.06); color:var(--text-secondary)">${ex.equipment}</span>
    <span class="ex-card-tag" style="background:rgba(255,255,255,0.06); color:var(--text-secondary)">${ex.difficulty}</span>
  `;

  // Render mistakes list
  const mistakesList = document.getElementById("modal-mistakes-list");
  mistakesList.innerHTML = "";
  ex.commonMistakes.forEach(mistake => {
    const li = document.createElement("li");
    li.textContent = mistake;
    mistakesList.appendChild(li);
  });

  // Setup loop video player
  const player = document.getElementById("modal-video-player");
  player.src = ex.videoUrl;
  player.load();
  player.play().catch(e => console.log("Video autoplay blocked. User click required."));

  // Check active workout context for button
  const addBtn = document.getElementById("modal-add-to-workout-btn");
  if (state.activeWorkout.isActive) {
    addBtn.style.display = "flex";
    addBtn.setAttribute("data-target-id", id);
  } else {
    addBtn.style.display = "none";
  }

  document.getElementById("exercise-details-modal").classList.add("active");
}

function closeExerciseDetailsModal(event) {
  // Pause video loop on close to save client resources
  const player = document.getElementById("modal-video-player");
  if (player) player.pause();
  
  document.getElementById("exercise-details-modal").classList.remove("active");
}

function addExerciseFromModalToActiveWorkout() {
  const btn = document.getElementById("modal-add-to-workout-btn");
  const id = btn.getAttribute("data-target-id");
  if (id) {
    selectExerciseForActiveWorkout(id);
    closeExerciseDetailsModal();
  }
}

// ==============================================
// UTILITIES AND NOTIFICATIONS
// ==============================================
function getTodayDateString() {
  return new Date().toISOString().split("T")[0];
}

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const hStr = hrs > 0 ? String(hrs).padStart(2, "0") + ":" : "";
  const mStr = String(mins).padStart(2, "0") + ":";
  const sStr = String(secs).padStart(2, "0");

  return hStr + mStr + sStr;
}

function showToast(message, type = "lime") {
  const wrapper = document.getElementById("toast-container-wrapper");
  const toast = document.createElement("div");
  // type can be: lime, cyan, orange, red
  toast.className = `toast ${type}`;
  
  let icon = "check-circle2";
  if (type === "cyan") icon = "bookmark";
  if (type === "orange") icon = "zap";
  if (type === "red") icon = "trash-2";

  toast.innerHTML = `
    <i data-lucide="${icon}"></i>
    <span style="font-size:0.9rem; font-weight:600;">${message}</span>
  `;
  wrapper.appendChild(toast);
  lucide.createIcons();

  // Slide out after 3.5s
  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s forwards cubic-bezier(0.16, 1, 0.3, 1)";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}

// Inject slideOut animation keyframes dynamically into the document head
const style = document.createElement('style');
style.innerHTML = `
  @keyframes slideOut {
    to { transform: translateX(120%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// ==============================================
// AUTHENTICATION & SESSION MANAGEMENT
// ==============================================

function toggleAppVisibility() {
  const landing = document.getElementById("landing-page-container");
  const app = document.getElementById("app-container");
  
  if (state.auth && state.auth.isLoggedIn) {
    landing.style.display = "none";
    app.style.display = "flex";
    
    // Trigger render dashboard
    const initialTab = window.location.hash.replace("#", "") || "dashboard";
    if (initialTab === "landing" || initialTab === "") {
      switchTab("dashboard");
    } else {
      switchTab(initialTab);
    }
  } else {
    landing.style.display = "block";
    app.style.display = "none";
    window.location.hash = "landing";
  }
  lucide.createIcons();
}

function openAuthModal(tabType = "signin") {
  document.getElementById("auth-modal").classList.add("active");
  toggleAuthTab(tabType);
}

function closeAuthModal() {
  document.getElementById("auth-modal").classList.remove("active");
}

function toggleAuthTab(tabType) {
  const signinBtn = document.getElementById("auth-tab-signin");
  const signupBtn = document.getElementById("auth-tab-signup");
  const signinForm = document.getElementById("signin-form");
  const signupForm = document.getElementById("signup-form");

  if (tabType === "signin") {
    signinBtn.classList.add("btn-primary");
    signinBtn.style.borderBottomColor = "var(--neon-lime)";
    signinBtn.style.color = "#fff";
    
    signupBtn.classList.remove("btn-primary");
    signupBtn.style.borderBottomColor = "transparent";
    signupBtn.style.color = "var(--text-secondary)";
    
    signinForm.style.display = "flex";
    signupForm.style.display = "none";
  } else {
    signupBtn.classList.add("btn-primary");
    signupBtn.style.borderBottomColor = "var(--neon-lime)";
    signupBtn.style.color = "#fff";
    
    signinBtn.classList.remove("btn-primary");
    signinBtn.style.borderBottomColor = "transparent";
    signinBtn.style.color = "var(--text-secondary)";
    
    signupForm.style.display = "flex";
    signinForm.style.display = "none";
  }
}

function handleUserSignIn(event) {
  event.preventDefault();
  const email = document.getElementById("signin-email").value.trim();
  
  // Set mock log in
  state.auth.isLoggedIn = true;
  state.auth.userEmail = email;
  
  // Sync display names
  if (email.includes("@")) {
    state.profile.name = email.split("@")[0].split(/[._-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }

  saveStateToLocalStorage();
  closeAuthModal();
  toggleAppVisibility();
  showToast(`Welcome back, ${state.profile.name}!`, "lime");
}

function handleUserSignUp(event) {
  event.preventDefault();
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const goal = document.getElementById("signup-goal").value;

  state.auth.isLoggedIn = true;
  state.auth.userEmail = email;
  state.profile.name = name;
  state.profile.goal = goal;

  saveStateToLocalStorage();
  syncProfileUI();
  closeAuthModal();
  toggleAppVisibility();
  showToast(`Welcome to FitTrack Pro, ${name}! 🎉`, "lime");
}

function loginWithDemoProfile() {
  state.auth.isLoggedIn = true;
  state.auth.userEmail = "guest@fittrack.com";
  state.profile.name = "Beginner Ben";
  state.profile.goal = "Lose Weight";
  state.profile.weight = 74.5;
  state.profile.height = 178;

  saveStateToLocalStorage();
  syncProfileUI();
  closeAuthModal();
  toggleAppVisibility();
  showToast("Demo profile loaded. Enjoy your preview! ⚡", "lime");
}

function logoutUser(event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  if (state.activeWorkout && state.activeWorkout.isActive) {
    if (!confirm("A workout session is currently active. Logging out will discard this session. Proceed?")) {
      return;
    }
    cancelWorkoutSilent();
  }

  state.auth.isLoggedIn = false;
  state.auth.userEmail = null;

  saveStateToLocalStorage();
  toggleAppVisibility();
  showToast("Successfully logged out.", "cyan");
}

function playLandingDemoVideo() {
  // Simulates opening a demo video by showing the bench press modal demonstration
  openExerciseDetailsModal("bench-press");
  showToast("Playing FitTrack workspace demo...", "cyan");
}
