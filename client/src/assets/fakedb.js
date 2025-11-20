const userAliceId = "675000000000000000000001";
const userBobId = "675000000000000000000002";
const coachChrisId = "675000000000000000000003";

const mealIds = {
  aliceBreakfast: "675000000000000000000101",
  aliceLunch: "675000000000000000000102",
  aliceDinner: "675000000000000000000103",
  aliceSnack: "675000000000000000000104",
  bobLunch: "675000000000000000000105",
  bobDinner: "675000000000000000000106",
};

const workoutIds = {
  alicePush: "675000000000000000000201",
  alicePull: "675000000000000000000202",
  aliceLegs: "675000000000000000000203",
  bobFullBody: "675000000000000000000204",
};

const workoutScheduleIds = {
  aliceSchedule: "675000000000000000000301",
  bobSchedule: "675000000000000000000302",
};

const nutritionPlanIds = {
  alicePlan: "675000000000000000000401",
  bobPlan: "675000000000000000000402",
};

// USERS ----------------------------------------------------------------------

export const users = [
  {
    _id: userAliceId,
    email: "alice@example.com",
    firstName: "Alice",
    lastName: "Nguyen",
    role: "user",
    isActive: true,
    profile: {
      age: 28,
      weight: 65,
      height: 168,
      gender: "female",
      fitnessLevel: "beginner",
      goals: ["lose-weight", "general-fitness"],
      availableEquipment: ["bodyweight", "dumbbells"],
      timePerWorkout: 45,
      workoutDaysPerWeek: 4,
      workoutSplit: "ppl",
      dietaryRestrictions: ["halal"],
      allergies: ["peanuts"],
    },
    preferences: {
      workoutTime: "evening",
      preferredExercises: ["squats", "push-ups", "walking"],
      dislikedExercises: ["burpees"],
      notifications: {
        email: true,
        push: true,
        workoutReminders: true,
      },
    },
    coachProfile: null,
    createdAt: "2025-01-01T10:00:00.000Z",
    updatedAt: "2025-01-05T10:00:00.000Z",
  },
  {
    _id: userBobId,
    email: "bob@example.com",
    firstName: "Bob",
    lastName: "Al Saud",
    role: "user",
    isActive: true,
    profile: {
      age: 34,
      weight: 82,
      height: 178,
      gender: "male",
      fitnessLevel: "intermediate",
      goals: ["build-muscle"],
      availableEquipment: ["full-gym-access"],
      timePerWorkout: 60,
      workoutDaysPerWeek: 5,
      workoutSplit: "ul",
      dietaryRestrictions: [],
      allergies: [],
    },
    preferences: {
      workoutTime: "morning",
      preferredExercises: ["bench press", "deadlift"],
      dislikedExercises: [],
      notifications: {
        email: false,
        push: true,
        workoutReminders: true,
      },
    },
    coachProfile: null,
    createdAt: "2025-01-02T08:30:00.000Z",
    updatedAt: "2025-01-06T08:30:00.000Z",
  },
  {
    _id: coachChrisId,
    email: "coach.chris@example.com",
    firstName: "Chris",
    lastName: "Hassan",
    role: "coach",
    isActive: true,
    profile: {
      age: 40,
      weight: 78,
      height: 180,
      gender: "male",
      fitnessLevel: "advanced",
      goals: ["build-muscle", "improve-endurance"],
      availableEquipment: ["full-gym-access"],
      timePerWorkout: 90,
      workoutDaysPerWeek: 6,
      workoutSplit: "custom",
      dietaryRestrictions: [],
      allergies: [],
    },
    coachProfile: {
      specialization: ["strength-training", "cardio", "nutrition"],
      experience: 12,
      bio: "Certified strength and conditioning coach helping busy professionals get lean and strong.",
      clients: [userAliceId, userBobId],
    },
    preferences: {
      workoutTime: "afternoon",
      preferredExercises: ["squats", "pull-ups", "sprints"],
      dislikedExercises: [],
      notifications: {
        email: true,
        push: true,
        workoutReminders: false,
      },
    },
    createdAt: "2025-01-03T12:00:00.000Z",
    updatedAt: "2025-01-07T12:00:00.000Z",
  },
];

// MEALS ----------------------------------------------------------------------

export const meals = [
  {
    _id: mealIds.aliceBreakfast,
    userId: userAliceId,
    name: "Greek Yogurt & Berry Bowl",
    description: "High-protein breakfast with fresh berries and honey.",
    calories: 350,
    protein: 25,
    carbs: 40,
    fat: 8,
    fiber: 5,
    ingredients: [
      "170g low-fat Greek yogurt",
      "50g mixed berries",
      "15g honey",
      "10g chopped almonds",
    ],
    instructions: [
      "Add Greek yogurt to a bowl.",
      "Top with berries and chopped almonds.",
      "Drizzle honey on top.",
    ],
    prepTime: 5,
    servings: 1,
    mealType: "breakfast",
    dietaryTags: ["high-protein", "vegetarian"],
    coachComments: [
      {
        coachId: coachChrisId,
        comment: "Perfect quick option before your evening workouts.",
        createdAt: "2025-01-04T09:00:00.000Z",
      },
    ],
    createdAt: "2025-01-04T08:50:00.000Z",
    updatedAt: "2025-01-04T08:50:00.000Z",
  },
  {
    _id: mealIds.aliceLunch,
    userId: userAliceId,
    name: "Grilled Chicken Salad",
    description:
      "Light salad with grilled chicken, mixed greens, and olive oil dressing.",
    calories: 480,
    protein: 40,
    carbs: 25,
    fat: 20,
    fiber: 6,
    ingredients: [
      "120g grilled chicken breast",
      "60g mixed greens",
      "50g cherry tomatoes",
      "30g cucumber",
      "10g olive oil",
      "Lemon juice, salt, pepper",
    ],
    instructions: [
      "Chop vegetables and add to bowl.",
      "Slice grilled chicken and place on top.",
      "Drizzle olive oil and lemon juice.",
      "Add salt and pepper to taste.",
    ],
    prepTime: 15,
    servings: 1,
    mealType: "lunch",
    dietaryTags: ["high-protein", "gluten-free"],
    coachComments: [],
    createdAt: "2025-01-04T09:30:00.000Z",
    updatedAt: "2025-01-04T09:30:00.000Z",
  },
  {
    _id: mealIds.aliceDinner,
    userId: userAliceId,
    name: "Baked Salmon with Quinoa",
    description: "Omega-3 rich salmon with fluffy quinoa and steamed broccoli.",
    calories: 620,
    protein: 42,
    carbs: 55,
    fat: 20,
    fiber: 7,
    ingredients: [
      "150g salmon fillet",
      "80g dry quinoa",
      "80g broccoli florets",
      "10g olive oil",
      "Garlic, salt, pepper, lemon",
    ],
    instructions: [
      "Preheat oven to 200°C.",
      "Season salmon with garlic, salt, pepper, and lemon.",
      "Bake salmon for 15–18 minutes.",
      "Cook quinoa according to package instructions.",
      "Steam broccoli for 5–7 minutes.",
    ],
    prepTime: 25,
    servings: 1,
    mealType: "dinner",
    dietaryTags: ["high-protein", "pescatarian"],
    coachComments: [],
    createdAt: "2025-01-04T10:00:00.000Z",
    updatedAt: "2025-01-04T10:00:00.000Z",
  },
  {
    _id: mealIds.aliceSnack,
    userId: userAliceId,
    name: "Apple & Peanut Butter",
    description: "Simple snack with fiber and healthy fats.",
    calories: 220,
    protein: 6,
    carbs: 24,
    fat: 12,
    fiber: 4,
    ingredients: ["1 medium apple", "20g peanut butter"],
    instructions: [
      "Slice the apple.",
      "Spread peanut butter on slices or use as a dip.",
    ],
    prepTime: 3,
    servings: 1,
    mealType: "snack",
    dietaryTags: ["vegetarian"],
    coachComments: [],
    createdAt: "2025-01-04T11:00:00.000Z",
    updatedAt: "2025-01-04T11:00:00.000Z",
  },
  {
    _id: mealIds.bobLunch,
    userId: userBobId,
    name: "Beef & Rice Bowl",
    description: "Muscle-building lunch with lean beef, rice, and vegetables.",
    calories: 700,
    protein: 45,
    carbs: 80,
    fat: 18,
    fiber: 6,
    ingredients: [
      "150g lean ground beef",
      "100g cooked basmati rice",
      "60g mixed veggies",
      "10g soy sauce",
    ],
    instructions: [
      "Cook beef in a pan until browned.",
      "Add veggies and stir-fry until tender.",
      "Serve over rice and drizzle soy sauce.",
    ],
    prepTime: 20,
    servings: 1,
    mealType: "lunch",
    dietaryTags: ["high-protein"],
    coachComments: [],
    createdAt: "2025-01-05T12:00:00.000Z",
    updatedAt: "2025-01-05T12:00:00.000Z",
  },
  {
    _id: mealIds.bobDinner,
    userId: userBobId,
    name: "Chicken Pasta",
    description: "Post-workout pasta with grilled chicken and tomato sauce.",
    calories: 820,
    protein: 50,
    carbs: 95,
    fat: 20,
    fiber: 8,
    ingredients: [
      "120g grilled chicken breast",
      "100g pasta",
      "100g tomato sauce",
      "Parmesan, herbs",
    ],
    instructions: [
      "Cook pasta until al dente.",
      "Heat tomato sauce.",
      "Slice chicken and combine with pasta and sauce.",
      "Top with parmesan and herbs.",
    ],
    prepTime: 25,
    servings: 1,
    mealType: "dinner",
    dietaryTags: ["high-protein"],
    coachComments: [],
    createdAt: "2025-01-05T19:00:00.000Z",
    updatedAt: "2025-01-05T19:00:00.000Z",
  },
];

// NUTRITION PLANS ------------------------------------------------------------

export const nutritionPlans = [
  {
    _id: nutritionPlanIds.alicePlan,
    userId: userAliceId,
    dailyCalorieTarget: 1900,
    macroTargets: {
      protein: 120,
      carbs: 190,
      fat: 60,
    },
    meals: [
      mealIds.aliceBreakfast,
      mealIds.aliceLunch,
      mealIds.aliceDinner,
      mealIds.aliceSnack,
    ],
    startDate: "2025-01-06T00:00:00.000Z",
    endDate: "2025-02-03T00:00:00.000Z",
    isActive: true,
    createdAt: "2025-01-05T15:00:00.000Z",
    updatedAt: "2025-01-05T15:00:00.000Z",
  },
  {
    _id: nutritionPlanIds.bobPlan,
    userId: userBobId,
    dailyCalorieTarget: 2600,
    macroTargets: {
      protein: 170,
      carbs: 260,
      fat: 80,
    },
    meals: [mealIds.bobLunch, mealIds.bobDinner],
    startDate: "2025-01-06T00:00:00.000Z",
    endDate: "2025-03-03T00:00:00.000Z",
    isActive: true,
    createdAt: "2025-01-05T16:00:00.000Z",
    updatedAt: "2025-01-05T16:00:00.000Z",
  },
];

// WORKOUTS (with embedded exercises) ----------------------------------------

export const workouts = [
  {
    _id: workoutIds.alicePush,
    userId: userAliceId,
    workoutType: "push",
    name: "Push Day A",
    description:
      "Beginner-friendly push session focusing on chest, shoulders, and triceps.",
    duration: 55,
    difficulty: "beginner",
    exercises: [
      {
        type: "warmup",
        name: "Treadmill Walk",
        description: "Easy walk to warm up.",
        sets: 1,
        reps: "—",
        weight: 0,
        duration: 300,
        restTime: 30,
        muscleGroups: ["full-body"],
        equipment: ["treadmill"],
        exerciseType: "warmup",
        instructions: ["Walk at comfortable pace for 5 minutes."],
        tips: ["Keep posture tall and relaxed."],
        isCompleted: false,
      },
      {
        type: "exercise",
        name: "Dumbbell Bench Press",
        description: "Flat bench dumbbell press.",
        sets: 3,
        reps: "8–10",
        weight: 10,
        duration: 0,
        restTime: 90,
        muscleGroups: ["chest", "triceps"],
        equipment: ["dumbbells", "bench"],
        exerciseType: "compound",
        instructions: [
          "Lie on bench with dumbbells at chest level.",
          "Press up until arms are straight.",
          "Lower under control.",
        ],
        tips: ["Keep feet planted and avoid arching lower back excessively."],
        isCompleted: false,
      },
      {
        type: "exercise",
        name: "Shoulder Dumbbell Press",
        description: "Seated overhead press.",
        sets: 3,
        reps: "10–12",
        weight: 8,
        restTime: 90,
        muscleGroups: ["shoulders", "triceps"],
        equipment: ["dumbbells", "bench"],
        exerciseType: "compound",
        instructions: [
          "Sit upright with dumbbells at shoulder height.",
          "Press overhead until arms are straight.",
          "Lower back to start.",
        ],
        tips: ["Avoid shrugging shoulders."],
        isCompleted: false,
      },
      {
        type: "cooldown",
        name: "Chest & Shoulder Stretch",
        description: "Static stretches for upper body.",
        sets: 1,
        reps: "—",
        duration: 180,
        restTime: 0,
        muscleGroups: ["chest", "shoulders"],
        equipment: [],
        exerciseType: "cooldown",
        instructions: ["Hold each stretch for 20–30 seconds."],
        tips: ["Breathe slowly, do not bounce."],
        isCompleted: false,
      },
    ],
    scheduledDate: "2025-01-06T18:00:00.000Z",
    isCompleted: false,
    isCoachEdited: true,
    createdBy: coachChrisId,
    lastEditedBy: coachChrisId,
    lastEditedAt: "2025-01-05T13:00:00.000Z",
    currentExerciseIndex: 0,
    notes: "Start with lighter dumbbells for first week.",
    createdAt: "2025-01-05T12:30:00.000Z",
    updatedAt: "2025-01-05T13:00:00.000Z",
  },
  {
    _id: workoutIds.alicePull,
    userId: userAliceId,
    workoutType: "pull",
    name: "Pull Day A",
    description: "Back and biceps workout.",
    duration: 50,
    difficulty: "beginner",
    exercises: [
      {
        type: "exercise",
        name: "Lat Pulldown",
        sets: 3,
        reps: "10–12",
        weight: 25,
        restTime: 90,
        muscleGroups: ["back", "biceps"],
        equipment: ["lat-pulldown-machine"],
        exerciseType: "compound",
        instructions: [
          "Grip bar slightly wider than shoulders.",
          "Pull bar to upper chest.",
          "Control the bar on the way up.",
        ],
        tips: ["Avoid swinging torso."],
        isCompleted: false,
      },
      {
        type: "exercise",
        name: "Seated Cable Row",
        sets: 3,
        reps: "10–12",
        weight: 20,
        restTime: 90,
        muscleGroups: ["back"],
        equipment: ["cable-row-machine"],
        exerciseType: "compound",
        instructions: ["Pull handle toward torso, squeeze shoulder blades."],
        tips: ["Keep chest up and avoid rounding back."],
        isCompleted: false,
      },
      {
        type: "exercise",
        name: "Dumbbell Bicep Curl",
        sets: 3,
        reps: "12–15",
        weight: 6,
        restTime: 60,
        muscleGroups: ["biceps"],
        equipment: ["dumbbells"],
        exerciseType: "accessory",
        instructions: [
          "Stand tall with dumbbells at sides.",
          "Curl up while keeping elbows close.",
        ],
        tips: ["Avoid swinging arms."],
        isCompleted: false,
      },
    ],
    scheduledDate: "2025-01-08T18:00:00.000Z",
    difficulty: "beginner",
    isCompleted: false,
    isCoachEdited: true,
    createdBy: coachChrisId,
    lastEditedBy: coachChrisId,
    lastEditedAt: "2025-01-05T13:10:00.000Z",
    currentExerciseIndex: 0,
    notes: "",
    createdAt: "2025-01-05T12:40:00.000Z",
    updatedAt: "2025-01-05T13:10:00.000Z",
  },
  {
    _id: workoutIds.aliceLegs,
    userId: userAliceId,
    workoutType: "legs",
    name: "Leg Day A",
    description: "Legs and glutes focus.",
    duration: 50,
    difficulty: "beginner",
    exercises: [
      {
        type: "exercise",
        name: "Goblet Squat",
        sets: 3,
        reps: "10–12",
        weight: 10,
        restTime: 90,
        muscleGroups: ["quads", "glutes"],
        equipment: ["dumbbell"],
        exerciseType: "compound",
        instructions: [
          "Hold dumbbell at chest and squat to comfortable depth.",
        ],
        tips: ["Keep knees tracking over toes."],
        isCompleted: false,
      },
      {
        type: "exercise",
        name: "Romanian Deadlift",
        sets: 3,
        reps: "10–12",
        weight: 20,
        restTime: 90,
        muscleGroups: ["hamstrings", "glutes"],
        equipment: ["dumbbells"],
        exerciseType: "compound",
        instructions: [
          "Hinge at hips with slight knee bend.",
          "Lower dumbbells along legs and return to standing.",
        ],
        tips: ["Maintain neutral spine."],
        isCompleted: false,
      },
      {
        type: "exercise",
        name: "Glute Bridge",
        sets: 3,
        reps: "12–15",
        weight: 0,
        restTime: 60,
        muscleGroups: ["glutes"],
        equipment: [],
        exerciseType: "accessory",
        instructions: ["Lift hips by squeezing glutes, then lower slowly."],
        tips: ["Avoid overextending lower back."],
        isCompleted: false,
      },
    ],
    scheduledDate: "2025-01-10T18:00:00.000Z",
    isCompleted: false,
    isCoachEdited: true,
    createdBy: coachChrisId,
    lastEditedBy: coachChrisId,
    lastEditedAt: "2025-01-05T13:20:00.000Z",
    currentExerciseIndex: 0,
    notes: "",
    createdAt: "2025-01-05T12:50:00.000Z",
    updatedAt: "2025-01-05T13:20:00.000Z",
  },
  {
    _id: workoutIds.bobFullBody,
    userId: userBobId,
    workoutType: "full-body",
    name: "Full Body Strength",
    description: "Intermediate full-body strength session.",
    duration: 70,
    difficulty: "intermediate",
    exercises: [
      {
        type: "exercise",
        name: "Back Squat",
        sets: 4,
        reps: "5",
        weight: 80,
        restTime: 150,
        muscleGroups: ["quads", "glutes"],
        equipment: ["barbell", "rack"],
        exerciseType: "compound",
        instructions: [
          "Squat below parallel if comfortable, then stand back up.",
        ],
        tips: ["Brace core before each rep."],
        isCompleted: false,
      },
      {
        type: "exercise",
        name: "Bench Press",
        sets: 4,
        reps: "5",
        weight: 75,
        restTime: 150,
        muscleGroups: ["chest", "triceps"],
        equipment: ["barbell", "bench"],
        exerciseType: "compound",
        instructions: ["Lower bar to mid-chest and press back up."],
        tips: ["Use a spotter for heavy sets."],
        isCompleted: false,
      },
      {
        type: "exercise",
        name: "Bent Over Row",
        sets: 4,
        reps: "8",
        weight: 60,
        restTime: 120,
        muscleGroups: ["back", "biceps"],
        equipment: ["barbell"],
        exerciseType: "compound",
        instructions: ["Row bar to lower chest while keeping back flat."],
        tips: ["Avoid jerking weight up."],
        isCompleted: false,
      },
    ],
    scheduledDate: "2025-01-07T06:00:00.000Z",
    isCompleted: false,
    isCoachEdited: false,
    createdBy: coachChrisId,
    lastEditedBy: null,
    lastEditedAt: null,
    currentExerciseIndex: 0,
    notes: "Main strength day. Keep 2–3 reps in reserve.",
    createdAt: "2025-01-05T14:00:00.000Z",
    updatedAt: "2025-01-05T14:00:00.000Z",
  },
];

// WORKOUT SCHEDULES ----------------------------------------------------------

export const workoutSchedules = [
  {
    _id: workoutScheduleIds.aliceSchedule,
    userId: userAliceId,
    splitType: "ppl",
    startDate: "2025-01-06T00:00:00.000Z",
    schedule: [
      {
        date: "2025-01-06T00:00:00.000Z",
        workoutType: "push",
        workoutId: workoutIds.alicePush,
        isCompleted: false,
        completedAt: null,
      },
      {
        date: "2025-01-08T00:00:00.000Z",
        workoutType: "pull",
        workoutId: workoutIds.alicePull,
        isCompleted: false,
        completedAt: null,
      },
      {
        date: "2025-01-10T00:00:00.000Z",
        workoutType: "legs",
        workoutId: workoutIds.aliceLegs,
        isCompleted: false,
        completedAt: null,
      },
    ],
    isActive: true,
    createdAt: "2025-01-05T15:30:00.000Z",
    updatedAt: "2025-01-05T15:30:00.000Z",
  },
  {
    _id: workoutScheduleIds.bobSchedule,
    userId: userBobId,
    splitType: "ul",
    startDate: "2025-01-06T00:00:00.000Z",
    schedule: [
      {
        date: "2025-01-07T00:00:00.000Z",
        workoutType: "full-body",
        workoutId: workoutIds.bobFullBody,
        isCompleted: false,
        completedAt: null,
      },
    ],
    isActive: true,
    createdAt: "2025-01-05T16:30:00.000Z",
    updatedAt: "2025-01-05T16:30:00.000Z",
  },
];

// Optionally export everything together
export default {
  users,
  meals,
  nutritionPlans,
  workouts,
  workoutSchedules,
};

// COACH HELPER
export function buildCoachDashboardData(
  coachId,
  { users, meals, nutritionPlans, workouts, workoutSchedules }
) {
  const normalizeId = (id) => String(id);

  const coach = users.find((u) => normalizeId(u._id) === normalizeId(coachId));

  if (
    !coach ||
    !coach.coachProfile ||
    !Array.isArray(coach.coachProfile.clients)
  ) {
    return {
      coach: coach || null,
      clients: [],
    };
  }

  // All client ids assigned to this coach
  const clientIds = new Set(
    coach.coachProfile.clients.map((id) => normalizeId(id))
  );

  // Only the users that are this coach's clients
  const clientUsers = users.filter((u) => clientIds.has(normalizeId(u._id)));

  // Helper: group an array by userId, but only for this coach's clients
  const groupByUserId = (items) => {
    const map = new Map();
    items.forEach((item) => {
      const key = normalizeId(item.userId);
      if (!clientIds.has(key)) return; // ignore non-clients

      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(item);
    });
    return map;
  };

  const mealsByUser = groupByUserId(meals);
  const plansByUser = groupByUserId(nutritionPlans);
  const workoutsByUser = groupByUserId(workouts);
  const schedulesByUser = groupByUserId(workoutSchedules);

  // Final structure: one object per client, fully separated
  const clients = clientUsers.map((client) => {
    const key = normalizeId(client._id);

    return {
      clientId: client._id,
      client, // full user object
      meals: mealsByUser.get(key) || [],
      nutritionPlans: plansByUser.get(key) || [],
      workouts: workoutsByUser.get(key) || [],
      workoutSchedules: schedulesByUser.get(key) || [],
    };
  });

  return {
    coach,
    clients,
  };
}
