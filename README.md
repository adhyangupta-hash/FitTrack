# FitTrack Pro - All-in-One Fitness Platform (MVP)

FitTrack Pro is a high-fidelity, unified web fitness platform. The design is inspired by the premium **FitMonks** Framer template, featuring an immersive dark-theme layout, glassmorphic panels, neon highlights (lime green, cyan, orange), and smooth micro-animations.

This application is built as a self-contained Single Page Application (SPA) utilizing:
- **Structure:** HTML5 Semantic Elements
- **Styling:** Custom CSS Variables & Layout Systems
- **Logic:** ES6+ JavaScript state engine with dynamic `localStorage` syncing
- **Analytics:** Chart.js loading via CDN
- **Iconography:** Lucide Icons loading via CDN
- **Fonts:** Outfit (headings) & Inter (body text) loading via Google Fonts

---

## Key Features

1. **Home Dashboard**
   - Live calendar day indicator and workout streak tracker.
   - Calorie consumption ring widget alongside macro progress metrics.
   - Circular goals visualizer showing percentage completions.
   - Horizontal scrolling carousel of recommended exercise tutorials.

2. **Workout Logger & Timer**
   - Active stopwatch recording training duration.
   - Input grids for sets, target repetitions, and weights.
   - Dynamic rest timer overlay with an audio alarm alert, skipping buttons, and incremental time extensions.
   - Instant calculation of total sets, completed repetitions, and accumulated training volume (kg).

3. **Detailed Exercise Library**
   - 25 seed exercises spanning Chest, Back, Shoulders, Arms, Legs, Core, and Cardio.
   - Filter dropdowns (by equipment or muscle group) and a search input.
   - Overlay modal displaying comprehensive instructions, common form mistakes, safety protocols, and direct HD looping video demonstrations.

4. **Exercise Video Platform**
   - Immersive thumbnail grid categorizing video lessons.
   - Capabilities to "Like" or "Save" tutorials into a personal bookmark collection.

5. **Workout Programs**
   - Pre-loaded training schedules (Beginner Full Body, Push-Pull-Legs, Hypertrophy, Fat Loss).
   - Custom Program Builder allowing you to specify program names, descriptions, scheduled training days, and selection dropdowns to bind exercises.

6. **Progress Analytics**
   - Log sheet for body weight.
   - Auto-updating interactive Chart.js line plot for body weight tracking.
   - Bar chart measuring completed training volume (kg) over your last 6 workouts.
   - Real-time BMI Calculator matching your biometric profile.

7. **Nutrition Tracking**
   - Interactive Calorie Target ring syncing macros (Protein, Carbs, Fats) on-the-fly.
   - Meal logging container adding item descriptions and nutrition thresholds.
   - Grid-based Water tracker (tap visual cups to log 250ml water cups).

8. **AI Fitness Coach**
   - Chatbot console loaded with context parameters (weight, goal, level).
   - Direct suggestions chips prompting responses for short workouts, recovery protocols, meal planning, and compound movement safety.
   - Direct "Load AI Workout" triggers that import suggested circuits straight to your active logger.

9. **Profile Customization**
   - Custom forms for Name, Age, Height, Weight, Activity Levels, and targets, adapting calculations in real-time.

---

## How to Launch the Application

Since this project uses no external compile-time dependencies, you can launch it in seconds using either option below:

### Option A: Open Directly in Browser
1. Open your file explorer and navigate to `Fitness_Web/`.
2. Double-click [index.html](file:///Users/adhyangupta/Documents/Fitness_Web/index.html) to open it in Google Chrome, Safari, Firefox, or Brave.

### Option B: Run via Local Ruby Server (Recommended)
To run with fully featured web server configurations (recommended for asset path resolution), use the pre-installed Ruby compiler:

1. Open your terminal application.
2. Run the following command:
   ```bash
   ruby -run -e httpd . -p 8000
   ```
3. Open your browser and navigate to:
   [http://localhost:8000](http://localhost:8000)
