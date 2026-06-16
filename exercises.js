// FitTrack Pro - Seed Exercise Database
// Loaded globally as a simple variable to avoid CORS module restrictions on local filesystems.

const EXERCISES = [
  {
    id: "bench-press",
    name: "Barbell Bench Press",
    muscleGroup: "Chest",
    equipment: "Barbell, Flat Bench",
    difficulty: "Intermediate",
    description: "The bench press is a classic compound exercise that targets the pectorals, anterior deltoids, and triceps. It is a cornerstone for building upper-body strength and mass.",
    videoUrl: "https://videos.pexels.com/video-files/3125907/3125907-uhd_2560_1440_25fps.mp4", // generic fitness/gym clip
    commonMistakes: [
      "Bouncing the bar off the chest.",
      "Flaring the elbows out at a 90-degree angle (increases shoulder strain).",
      "Lifting the hips/butt off the bench."
    ],
    safetyInstructions: "Always use a spotter when lifting heavy. Ensure your feet are planted firmly on the floor, and keep a slight arch in your lower back while keeping your shoulder blades retracted."
  },
  {
    id: "incline-dumbbell-press",
    name: "Incline Dumbbell Press",
    muscleGroup: "Chest",
    equipment: "Dumbbells, Incline Bench",
    difficulty: "Intermediate",
    description: "This variation targets the upper portion of the pectoral muscles (clavicular head) along with the shoulders and triceps.",
    videoUrl: "https://videos.pexels.com/video-files/4761423/4761423-sd_500_960_25fps.mp4",
    commonMistakes: [
      "Setting the incline angle too high (above 45 degrees shifts work to shoulders).",
      "Clashing the dumbbells together at the top, losing tension.",
      "Incomplete range of motion."
    ],
    safetyInstructions: "Choose a weight you can control on the descent. Push the dumbbells up in a smooth arch, keeping your wrists stacked directly above your elbows."
  },
  {
    id: "push-up",
    name: "Standard Push-Up",
    muscleGroup: "Chest",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    description: "A fundamental bodyweight exercise that strengthens the chest, shoulders, arms, and core. Highly adaptable for all fitness levels.",
    videoUrl: "https://videos.pexels.com/video-files/5385834/5385834-sd_500_960_25fps.mp4",
    commonMistakes: [
      "Sagging lower back or hips.",
      "Flaring elbows excessively.",
      "Looking up or tucking the chin too much."
    ],
    safetyInstructions: "Keep your body in a straight line from head to heels. Engage your core and glutes to protect your lower back."
  },
  {
    id: "cable-flyes",
    name: "Cable Chest Fly",
    muscleGroup: "Chest",
    equipment: "Cable Machine",
    difficulty: "Intermediate",
    description: "An isolation exercise that provides constant tension on the pectoral muscles throughout the entire range of motion, excellent for muscle definition.",
    videoUrl: "https://videos.pexels.com/video-files/4754025/4754025-sd_500_960_25fps.mp4",
    commonMistakes: [
      "Pressing the weight instead of flying (bending elbows too much).",
      "Using momentum/leaning forward excessively.",
      "Overextending the arms at the back, straining the shoulder joints."
    ],
    safetyInstructions: "Keep a slight bend in your elbows. Stand with one foot forward for stability, and control the release of the cables."
  },
  {
    id: "pull-up",
    name: "Pull-Up",
    muscleGroup: "Back",
    equipment: "Pull-up Bar",
    difficulty: "Advanced",
    description: "An elite upper-body pull exercise that heavily recruits the latissimus dorsi, rhomboids, trapezius, and biceps.",
    videoUrl: "https://videos.pexels.com/video-files/4753995/4753995-sd_500_960_25fps.mp4",
    commonMistakes: [
      "Kipping or using leg swing to generate momentum.",
      "Not pulling high enough (chin should clear the bar).",
      "Shrugging the shoulders up instead of keeping them depressed."
    ],
    safetyInstructions: "If you cannot do a full pull-up, use a resistance band or assisted pull-up machine to build the baseline strength safely."
  },
  {
    id: "barbell-row",
    name: "Bent-Over Barbell Row",
    muscleGroup: "Back",
    equipment: "Barbell",
    difficulty: "Intermediate",
    description: "A powerful compound movement that targets the entire back, including the lats, traps, rhomboids, and lower back stabilizer muscles.",
    videoUrl: "https://videos.pexels.com/video-files/4761421/4761421-sd_500_960_25fps.mp4",
    commonMistakes: [
      "Rounding the lower back (extreme injury risk).",
      "Standing too upright, which turns it into a shrug.",
      "Pulling the bar with the biceps instead of leading with the elbows."
    ],
    safetyInstructions: "Keep your spine neutral (flat back) throughout. Pull the barbell toward your lower stomach/belly button, keeping your core braced."
  },
  {
    id: "lat-pulldown",
    name: "Cable Lat Pulldown",
    muscleGroup: "Back",
    equipment: "Cable Machine, Pulldown Bar",
    difficulty: "Beginner",
    description: "A staple machine exercise designed to mimic the pull-up, specifically targeting the latissimus dorsi to create upper back width.",
    videoUrl: "https://videos.pexels.com/video-files/4754030/4754030-sd_500_960_25fps.mp4",
    commonMistakes: [
      "Leaning back excessively and pulling with bodyweight.",
      "Pulling the bar down behind the neck (dangerous for rotator cuffs).",
      "Allowing the shoulders to shrug up at the top of the movement."
    ],
    safetyInstructions: "Pull the bar down to your upper chest. Keep your chest up and squeeze your shoulder blades together at the bottom."
  },
  {
    id: "dumbbell-row",
    name: "Single-Arm Dumbbell Row",
    muscleGroup: "Back",
    equipment: "Dumbbell, Flat Bench",
    difficulty: "Beginner",
    description: "Allows for unilateral (one-sided) back training, helping to correct strength imbalances between sides while building thickness in the lats and traps.",
    videoUrl: "https://videos.pexels.com/video-files/4754020/4754020-sd_500_960_25fps.mp4",
    commonMistakes: [
      "Rounding the spine.",
      "Rotating the torso to pull the weight higher.",
      "Rushing the negative (dropping the weight)."
    ],
    safetyInstructions: "Support your body with one knee and hand on the bench. Keep your spine aligned, pull the dumbbell to your hip, and lower it slowly."
  },
  {
    id: "overhead-press",
    name: "Standing Barbell Overhead Press",
    muscleGroup: "Shoulders",
    equipment: "Barbell",
    difficulty: "Advanced",
    description: "Also known as the Military Press, this compound exercise builds massive shoulders, triceps, and upper chest, while demanding core stability.",
    videoUrl: "https://videos.pexels.com/video-files/4761427/4761427-sd_500_960_25fps.mp4",
    commonMistakes: [
      "Excessive arching of the lower back (leaning backward).",
      "Not locking out at the top or completing the full range of motion.",
      "Pushing the bar forward instead of straight up."
    ],
    safetyInstructions: "Squeeze your glutes and brace your core intensely. This creates a solid foundation and protects your lumbar spine from hyperextension."
  },
  {
    id: "lateral-raise",
    name: "Dumbbell Lateral Raise",
    muscleGroup: "Shoulders",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    description: "An isolation movement that targets the lateral (side) deltoid head, key to developing shoulder width and the classic 'V-taper' silhouette.",
    videoUrl: "https://videos.pexels.com/video-files/4754013/4754013-sd_500_960_25fps.mp4",
    commonMistakes: [
      "Shrugging the shoulders up (using the upper traps to swing the weight).",
      "Leading with the hands instead of the elbows (hands higher than elbows).",
      "Using too much weight and swinging the body."
    ],
    safetyInstructions: "Keep a slight bend in your elbows and tilt your hands slightly forward at the top (as if pouring out pitchers of water)."
  },
  {
    id: "face-pull",
    name: "Cable Face Pull",
    muscleGroup: "Shoulders",
    equipment: "Cable Machine, Rope Attachment",
    difficulty: "Intermediate",
    description: "Excellent for the rear delts, rotator cuffs, and upper back. It is critical for shoulder health, posture, and balancing chest-heavy workouts.",
    videoUrl: "https://videos.pexels.com/video-files/4754023/4754023-sd_500_960_25fps.mp4",
    commonMistakes: [
      "Pulling toward the chest instead of the forehead/nose.",
      "Moving too fast and using momentum.",
      "Failing to rotate the shoulders outward at the end of the pull."
    ],
    safetyInstructions: "Pull the rope toward your face while separating your hands. Hold the contraction for a split second to engage the rear deltoid fully."
  },
  {
    id: "barbell-curl",
    name: "Standing Barbell Bicep Curl",
    muscleGroup: "Arms",
    equipment: "Barbell",
    difficulty: "Beginner",
    description: "The classic mass builder for the biceps. It targets the short and long heads of the bicep brachii.",
    videoUrl: "https://videos.pexels.com/video-files/4754010/4754010-sd_500_960_25fps.mp4",
    commonMistakes: [
      "Swinging the hips to lift the bar.",
      "Letting the elbows drift forward too much (recruits shoulders).",
      "Failing to extend the arms fully at the bottom."
    ],
    safetyInstructions: "Keep your elbows pinned to your sides. Stand tall, brace your core, and control the weight on the way down."
  },
  {
    id: "dumbbell-hammer-curl",
    name: "Dumbbell Hammer Curl",
    muscleGroup: "Arms",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    description: "By using a neutral grip (palms facing each other), this exercise targets the brachialis and brachioradialis, adding thickness to the arms.",
    videoUrl: "https://videos.pexels.com/video-files/4754029/4754029-sd_500_960_25fps.mp4",
    commonMistakes: [
      "Swinging the weights.",
      "Tucking elbows backward.",
      "Wrists flexing or bending."
    ],
    safetyInstructions: "Keep your grip neutral. Focus on pulling the dumbbell head up toward your shoulder with zero body swing."
  },
  {
    id: "tricep-overhead-extension",
    name: "Overhead Dumbbell Tricep Extension",
    muscleGroup: "Arms",
    equipment: "Dumbbell, Flat Bench",
    difficulty: "Intermediate",
    description: "Specifically targets the long head of the triceps by stretching it in the overhead position, maximizing muscle growth.",
    videoUrl: "https://videos.pexels.com/video-files/4754021/4754021-sd_500_960_25fps.mp4",
    commonMistakes: [
      "Allowing elbows to flare outward excessively.",
      "Arching the lower back too much.",
      "Lowering the dumbbell too fast and risking hitting the neck/head."
    ],
    safetyInstructions: "Hold the dumbbell with both hands under the inner plate. Keep elbows tucked in close to your head throughout the lift."
  },
  {
    id: "tricep-pushdown",
    name: "Tricep Rope Pushdown",
    muscleGroup: "Arms",
    equipment: "Cable Machine, Rope Attachment",
    difficulty: "Beginner",
    description: "An isolation movement that targets the lateral and medial heads of the triceps. Excellent for achieving a deep burn and pump.",
    videoUrl: "https://videos.pexels.com/video-files/4754015/4754015-sd_500_960_25fps.mp4",
    commonMistakes: [
      "Letting the elbows flare out or move forward and backward.",
      "Leaning over the rope and using bodyweight to push down.",
      "Not separating the rope ends at the bottom of the movement."
    ],
    safetyInstructions: "Keep your elbows pinned to your ribs. Push down, flare the rope outwards at the bottom, and squeeze your triceps."
  },
  {
    id: "barbell-squat",
    name: "Barbell Back Squat",
    muscleGroup: "Legs",
    equipment: "Barbell, Squat Rack",
    difficulty: "Advanced",
    description: "The 'King of Exercises' for lower body development. Targets the quadriceps, glutes, hamstrings, calves, and core stabilizers.",
    videoUrl: "https://videos.pexels.com/video-files/4325515/4325515-uhd_2732_1440_30fps.mp4",
    commonMistakes: [
      "Allowing knees to cave inward (valgus collapse).",
      "Heels lifting off the ground.",
      "Rounding the lower back at the bottom ('butt wink')."
    ],
    safetyInstructions: "Ensure safety bars are set in the rack. Rest the bar on your upper traps (not your neck). Squat to at least parallel (hips inline with knees) safely."
  },
  {
    id: "romanian-deadlift",
    name: "Romanian Deadlift (RDL)",
    muscleGroup: "Legs",
    equipment: "Barbell or Dumbbells",
    difficulty: "Intermediate",
    description: "A premier hip hinge movement focusing on the posterior chain, specifically targeting the hamstrings, gluteus maximus, and lower back.",
    videoUrl: "https://videos.pexels.com/video-files/4761793/4761793-sd_500_960_25fps.mp4",
    commonMistakes: [
      "Bending the knees too much (turns it into a regular squat).",
      "Letting the bar drift away from the legs.",
      "Rounding the back."
    ],
    safetyInstructions: "Initiate the movement by pushing your hips back. Keep the bar touching your legs, knee bend slight, and pull with hamstrings/glutes."
  },
  {
    id: "leg-extension",
    name: "Machine Leg Extension",
    muscleGroup: "Legs",
    equipment: "Leg Extension Machine",
    difficulty: "Beginner",
    description: "An isolation exercise that isolates the quadriceps, perfect for building muscular definition and targeted thigh strength.",
    videoUrl: "https://videos.pexels.com/video-files/4754024/4754024-sd_500_960_25fps.mp4",
    commonMistakes: [
      "Letting the weight plates slam at the bottom.",
      "Lifting hips off the seat.",
      "Using jerky, rapid motions instead of control."
    ],
    safetyInstructions: "Align your knee joint with the pivot point of the machine. Hold the handles securely to keep your hips firmly planted."
  },
  {
    id: "calf-raise",
    name: "Standing Calf Raise",
    muscleGroup: "Legs",
    equipment: "Calf Machine or Dumbbells",
    difficulty: "Beginner",
    description: "Isolates the gastrocnemius muscle of the calves, essential for lower leg power, stability, and aesthetics.",
    videoUrl: "https://videos.pexels.com/video-files/4754022/4754022-sd_500_960_25fps.mp4",
    commonMistakes: [
      "Bouncing at the bottom (using Achilles tendon elasticity instead of muscle).",
      "Incomplete stretch or squeeze.",
      "Bending the knees to assist."
    ],
    safetyInstructions: "Lower your heels slowly to feel a deep stretch, hold for 1 second, then explode upward onto your toes and squeeze."
  },
  {
    id: "hanging-leg-raise",
    name: "Hanging Leg Raise",
    muscleGroup: "Core",
    equipment: "Pull-up Bar",
    difficulty: "Advanced",
    description: "An exceptional core builder that targets the lower abdominals, obliques, and hip flexors, requiring grip and shoulder stability.",
    videoUrl: "https://videos.pexels.com/video-files/4753994/4753994-sd_500_960_25fps.mp4",
    commonMistakes: [
      "Swinging the body to raise the legs.",
      "Failing to engage the abs (just using hip flexors).",
      "Dropping the legs too fast."
    ],
    safetyInstructions: "Keep a active shoulder engagement. Raise your feet as high as possible, rotating your pelvis up, and lower under control."
  },
  {
    id: "plank",
    name: "Forearm Plank",
    muscleGroup: "Core",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    description: "The ultimate isometric core exercise. It builds deep abdominal strength, endurance, and full-body stability.",
    videoUrl: "https://videos.pexels.com/video-files/4754019/4754019-sd_500_960_25fps.mp4",
    commonMistakes: [
      "Sinking the hips or raising them too high.",
      "Looking straight ahead, straining the neck.",
      "Holding the breath."
    ],
    safetyInstructions: "Place elbows directly under shoulders. Maintain a straight spine. Pull your belly button in and squeeze your glutes."
  },
  {
    id: "russian-twist",
    name: "Weighted Russian Twist",
    muscleGroup: "Core",
    equipment: "Medicine Ball or Dumbbell",
    difficulty: "Intermediate",
    description: "Targets the obliques and transverse abdominis. The rotational movement is excellent for athletic rotation and core strength.",
    videoUrl: "https://videos.pexels.com/video-files/4753993/4753993-sd_500_960_25fps.mp4",
    commonMistakes: [
      "Moving only the arms, not rotating the shoulders.",
      "Rounding the lower back.",
      "Rushing the speed of rotation."
    ],
    safetyInstructions: "Lean back slightly with your chest high and back flat. Rotate your chest from side to side, keeping your hips stable."
  },
  {
    id: "treadmill-run",
    name: "Treadmill Running",
    muscleGroup: "Cardio",
    equipment: "Treadmill",
    difficulty: "Beginner",
    description: "An essential cardiovascular workout that burns calories, improves lung capacity, and builds lower-body endurance.",
    videoUrl: "https://videos.pexels.com/video-files/3125916/3125916-uhd_2560_1440_25fps.mp4",
    commonMistakes: [
      "Holding onto the side rails while running.",
      "Stomping heavily on heels.",
      "Not adjusting incline or speed to match fitness level."
    ],
    safetyInstructions: "Clip on the safety key. Look straight ahead, maintain a upright posture, and wear supportive running shoes."
  },
  {
    id: "jump-rope",
    name: "Jump Rope (Cardio)",
    muscleGroup: "Cardio",
    equipment: "Jump Rope",
    difficulty: "Intermediate",
    description: "A high-intensity calorie burner that boosts coordination, calf strength, agility, and overall cardiovascular fitness.",
    videoUrl: "https://videos.pexels.com/video-files/5385817/5385817-sd_500_960_25fps.mp4",
    commonMistakes: [
      "Jumping too high off the floor (should be minimal).",
      "Using whole arms to swing the rope instead of just wrists.",
      "Landing flat-footed."
    ],
    safetyInstructions: "Stay light on the balls of your feet. Keep your elbows tucked close to your body and rotation coming from your wrists."
  },
  {
    id: "burpee",
    name: "Burpee",
    muscleGroup: "Cardio",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    description: "A full-body explosive exercise that combines a squat, push-up, and vertical jump. Incredible for conditioning and calorie burning.",
    videoUrl: "https://videos.pexels.com/video-files/5385827/5385827-sd_500_960_25fps.mp4",
    commonMistakes: [
      "Allowing the lower back to sag during the plank phase.",
      "Landing heavily on feet/joints.",
      "Skipping the push-up or jump."
    ],
    safetyInstructions: "Land with soft knees on the jump. If needed, modify by stepping back into the plank instead of jumping back."
  }
];
