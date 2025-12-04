const User = require('../models/User');
const Workout = require('../models/Workout');
const Meal = require('../models/Meal');
const NutritionPlan = require('../models/NutritionPlan');
const WorkoutSchedule = require('../models/WorkoutSchedule');
const OpenAIService = require('../services/openai');
const ParallelAIService = require('../services/parallelAIService');
const ScheduleService = require('../services/scheduleService');
const ChatService = require('../services/chatService');
const { getTodayRange, normalize } = require("../utils/date");

// Complete user onboarding
// const completeOnboarding = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { profile, preferences } = req.body;

//     // Update user profile and preferences
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { 
//         profile: { ...profile },
//         preferences: { ...preferences }
//       },
//       { new: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     // Create user object with updated profile for AI generation
//     // const user = {
//     //   ...updatedUser,
//     //   profile: { ...profile },
//     //   preferences: { ...preferences }
//     // };
//     const user = await User.findById(userId);

//     // Generate AI-powered workout and nutrition plans using PARALLEL PROCESSING
//     try {
//       console.log('=== STARTING PARALLEL AI GENERATION ===');
      
//       // Calculate daily calorie target
//       const dailyCalorieTarget = OpenAIService.calculateDailyCalorieTarget(user.profile);
//       console.log('Daily calorie target:', dailyCalorieTarget);

//       // PARALLEL PROCESSING: Generate workout and nutrition plans simultaneously
//       const [exercisesResult, mealsResult] = await Promise.allSettled([
//         // Task 1: Generate workout plan using parallel processing
//         ParallelAIService.generateWorkoutPlanParallel(
//           user.profile,
//           user.preferences,
//           user.profile.workoutDaysPerWeek,
//           user.profile.workoutSplit || 'custom'
//         ),
        
//         // Task 2: Generate meal plan using parallel processing
//         ParallelAIService.generateMealPlanParallel(
//           user.profile,
//           dailyCalorieTarget,
//           user.profile.dietaryRestrictions,
//           user.profile.allergies
//         )
//       ]);

//       // Handle workout generation result
//       let exercises;
//       if (exercisesResult.status === 'fulfilled') {
//         exercises = exercisesResult.value;
//         console.log('✅ Workout plan generated successfully:', exercises.length, 'exercises');
//       } else {
//         console.log('⚠️ Parallel workout generation failed, trying sequential:', exercisesResult.reason?.message);
//         try {
//           exercises = await OpenAIService.generateWorkoutPlan(
//             user.profile,
//             user.preferences,
//             user.profile.workoutDaysPerWeek
//           );
//         } catch (error) {
//           console.log('⚠️ Sequential workout generation failed, using fallback:', error.message);
//           exercises = OpenAIService.generateTemplateWorkout(
//             user.profile,
//             user.preferences,
//             user.profile.workoutDaysPerWeek,
//             user.profile.workoutSplit || 'custom'
//           );
//         }
//       }

//       // Handle meal generation result
//       let meals;
//       if (mealsResult.status === 'fulfilled') {
//         meals = mealsResult.value;
//         // Handle both array format and object with meals property
//         meals = Array.isArray(meals) ? meals : (meals.meals || []);
//         console.log('✅ Meal plan generated successfully:', meals.length, 'meals');
//       } else {
//         console.log('⚠️ Parallel meal generation failed, trying sequential:', mealsResult.reason?.message);
//         try {
//           const mealPlan = await OpenAIService.generateMealPlan(
//             user.profile,
//             dailyCalorieTarget,
//             user.profile.dietaryRestrictions,
//             user.profile.allergies
//           );
//           meals = Array.isArray(mealPlan) ? mealPlan : mealPlan.meals;
//         } catch (error) {
//           console.log('⚠️ Sequential meal generation failed, using fallback:', error.message);
//           meals = [
//             {
//               name: "Protein Smoothie",
//               description: "Nutritious breakfast smoothie",
//               calories: 300,
//               protein: 25,
//               carbs: 30,
//               fat: 8,
//               fiber: 5,
//               ingredients: ["banana", "protein powder", "almond milk", "spinach"],
//               instructions: ["Add all ingredients to blender", "Blend until smooth", "Pour into glass and serve"],
//               prepTime: 5,
//               servings: 1,
//               mealType: "breakfast",
//               dietaryTags: ["high-protein", "quick"]
//             },
//             {
//               name: "Grilled Chicken Salad",
//               description: "Healthy lunch option",
//               calories: 400,
//               protein: 35,
//               carbs: 20,
//               fat: 15,
//               fiber: 8,
//               ingredients: ["chicken breast", "mixed greens", "tomatoes", "cucumber", "olive oil"],
//               instructions: ["Grill chicken breast until cooked through", "Chop vegetables and mix with greens", "Slice chicken and add to salad", "Drizzle with olive oil dressing"],
//               prepTime: 15,
//               servings: 1,
//               mealType: "lunch",
//               dietaryTags: ["high-protein", "low-carb"]
//             }
//           ];
//         }
//       }

//       console.log('=== PARALLEL GENERATION COMPLETE ===');

//       // Save meals to database
//       const savedMeals = await Meal.insertMany(meals.map(meal => ({
//         ...meal,
//         userId
//       })));

//       // Create nutrition plan
//       const nutritionPlan = new NutritionPlan({
//         userId,
//         dailyCalorieTarget,
//         macroTargets: {
//           protein: Math.round(dailyCalorieTarget * 0.25 / 4), // 25% protein
//           carbs: Math.round(dailyCalorieTarget * 0.45 / 4), // 45% carbs
//           fat: Math.round(dailyCalorieTarget * 0.30 / 9) // 30% fat
//         },
//         meals: savedMeals.map(meal => meal._id),
//         startDate: new Date().toISOString(),
//         endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
//         isActive: true
//       });

//       await nutritionPlan.save();

//       // Create individual workouts for the week
//       // Map frontend split values to backend enum values
//       const splitMapping = {
//         'ppl': 'ppl',
//         'upper-lower': 'ul',
//         'full-body': 'fb',
//         'custom': 'custom'
//       };
      
//       const mappedSplit = splitMapping[user.profile.workoutSplit] || 'custom';

//       // Generate workout schedule
//       const schedule = await ScheduleService.generateSchedule(
//         userId,
//         mappedSplit,
//         user.profile.workoutDaysPerWeek
//       );

//       // Generate workout plans for each workout type in the schedule using PARALLEL PROCESSING
//       const workoutPlans = {};
//       const uniqueWorkoutTypes = [...new Set(schedule.schedule.map(s => s.workoutType))].filter(Boolean);
      
//       console.log('Generating workouts for types:', uniqueWorkoutTypes);
      
//       // Generate all workout types in parallel
//       const workoutPromises = uniqueWorkoutTypes.map(async (workoutType) => {
//         try {
//           // Use parallel processing for each workout type
//           const workoutPlan = await ParallelAIService.generateWorkoutPlanParallel(
//             user.profile,
//             user.preferences,
//             user.profile.workoutDaysPerWeek,
//             workoutType
//           );

//           return { workoutType, workoutPlan };
//         } catch (error) {
//           console.error(`Error generating ${workoutType} workout:`, error);
//           // Fallback to sequential
//           const workoutPlan = await OpenAIService.generateWorkoutPlan(
//             user.profile,
//             user.preferences,
//             user.profile.workoutDaysPerWeek,
//             workoutType
//           );
//           return { workoutType, workoutPlan };
//         }
//       });

//       // Wait for all workouts to be generated in parallel
//       const workoutResults = await Promise.all(workoutPromises);
      
//       // Create workout documents and schedule them properly
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
      
//       // Create workouts for each schedule item that needs one
//       for (let i = 0; i < schedule.schedule.length; i++) {
//         const scheduleItem = schedule.schedule[i];
//         if (!scheduleItem.workoutType) continue;
        
//         // Find the workout plan for this workout type
//         const workoutResult = workoutResults.find(r => r.workoutType === scheduleItem.workoutType);
//         if (!workoutResult) continue;
        
//         // Use the schedule date, or default to today if not set
//         let scheduledDate = scheduleItem.date ? new Date(scheduleItem.date) : new Date(today);
//         const dateStart = new Date(scheduledDate);
//         dateStart.setHours(0, 0, 0, 0);
//         const dateEnd = new Date(scheduledDate);
//         dateEnd.setHours(23, 59, 59, 999);
//         scheduledDate.setHours(9, 0, 0, 0);
        
//         // Check if a workout already exists for this date and type
//         const existingWorkout = await Workout.findOne({
//           userId,
//           workoutType: scheduleItem.workoutType,
//           scheduledDate: {
//             $gte: dateStart,
//             $lt: dateEnd
//           }
//         });
        
//         if (existingWorkout) {
//           scheduleItem.workoutId = existingWorkout._id;
//           continue;
//         }
        
//         const workout = new Workout({
//           userId,
//           workoutType: scheduleItem.workoutType,
//           name: `${scheduleItem.workoutType.charAt(0).toUpperCase() + scheduleItem.workoutType.slice(1)} Workout`,
//           description: `Personalized ${scheduleItem.workoutType} workout for ${user.profile.fitnessLevel} level`,
//           duration: user.profile.timePerWorkout,
//           difficulty: user.profile.fitnessLevel,
//           exercises: workoutResult.workoutPlan,
//           scheduledDate: scheduledDate.toISOString(),
//           isCompleted: false,
//           currentExerciseIndex: 0
//         });
//         await workout.save();
        
//         // Link workout to schedule item
//         scheduleItem.workoutId = workout._id;
//         workoutPlans[scheduleItem.workoutType] = workout._id;
//       }

//       // Update schedule with workout IDs
//       for (let i = 0; i < schedule.schedule.length; i++) {
//         const scheduleItem = schedule.schedule[i];
//         if (scheduleItem.workoutType && workoutPlans[scheduleItem.workoutType]) {
//           scheduleItem.workoutId = workoutPlans[scheduleItem.workoutType];
//         }
//       }
//       await schedule.save();

//       // Generate comprehensive plan overview automatically
//       let planExplanation = null;
//       try {
//         const recentWorkouts = await Workout.find({ userId })
//           .sort({ scheduledDate: -1 })
//           .limit(5);
        
//         planExplanation = await OpenAIService.generatePlanExplanation(
//           user.profile,
//           user.preferences,
//           schedule,
//           nutritionPlan,
//           recentWorkouts
//         );
        
//         // Store plan explanation in user profile
//         user.profile.planExplanation = planExplanation;
//         await user.save();
//       } catch (error) {
//         console.error('Error generating plan explanation during onboarding:', error);
//         // Don't fail onboarding if plan explanation fails
//       }

//       res.status(200).json({
//         success: true,
//         message: 'Onboarding completed successfully',
//         data: {
//           user: {
//             id: user._id,
//             profile: user.profile,
//             preferences: user.preferences
//           },
//           nutritionPlan: {
//             id: nutritionPlan._id,
//             dailyCalorieTarget,
//             meals: savedMeals
//           },
//           workoutPlan: {
//             id: nutritionPlan._id, // Using nutrition plan ID as workout plan ID for simplicity
//             workouts: Object.keys(workoutPlans).length
//           },
//           planExplanation: planExplanation
//         }
//       });
//     } catch (error) {
//       console.error('Error generating AI plans:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to generate personalized plans',
//         error: error.message
//       });
//     }
//   } catch (error) {
//     console.error('Onboarding error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Onboarding failed',
//       error: error.message
//     });
//   }
// };

const completeOnboarding = async (req, res) => {
  try {
    const userId = req.user._id;
    const { profile, preferences } = req.body;

    // Update user profile + preferences
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profile: { ...profile },
        preferences: { ...preferences }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Re-fetch REAL mongoose user document
    const user = await User.findById(userId);

    // Calculate calorie target
    const dailyCalorieTarget = OpenAIService.calculateDailyCalorieTarget(user.profile);

    console.log("=== STARTING PARALLEL AI GENERATION ===");

    // Generate workout + meal plans in parallel
    const [exercisesResult, mealsResult] = await Promise.allSettled([
      ParallelAIService.generateWorkoutPlanParallel(
        user.profile,
        user.preferences,
        user.profile.workoutDaysPerWeek,
        user.profile.workoutSplit || "custom"
      ),
      ParallelAIService.generateMealPlanParallel(
        user.profile,
        dailyCalorieTarget,
        user.profile.dietaryRestrictions,
        user.profile.allergies
      )
    ]);

    // Handle workout generation results
    let exercises;
    if (exercisesResult.status === "fulfilled") {
      exercises = exercisesResult.value;
    } else {
      exercises = await OpenAIService.generateWorkoutPlan(
        user.profile,
        user.preferences,
        user.profile.workoutDaysPerWeek
      );
    }

    // Handle meal generation results
    let meals;
    if (mealsResult.status === "fulfilled") {
      meals = Array.isArray(mealsResult.value)
        ? mealsResult.value
        : mealsResult.value.meals;
    } else {
      meals = await OpenAIService.generateMealPlan(
        user.profile,
        dailyCalorieTarget,
        user.profile.dietaryRestrictions,
        user.profile.allergies
      );
    }

    console.log("=== PARALLEL GENERATION COMPLETE ===");

    // Save meals
    const savedMeals = await Meal.insertMany(
      meals.map(m => ({ ...m, userId }))
    );

    // Create nutrition plan
    const nutritionPlan = new NutritionPlan({
      userId,
      dailyCalorieTarget,
      macroTargets: {
        protein: Math.round(dailyCalorieTarget * 0.25 / 4),
        carbs: Math.round(dailyCalorieTarget * 0.45 / 4),
        fat: Math.round(dailyCalorieTarget * 0.30 / 9)
      },
      meals: savedMeals.map(m => m._id),
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 86400000),
      isActive: true
    });

    await nutritionPlan.save();

    // ============================
    // GENERATE 7-DAY SCHEDULE
    // ============================
    const splitMapping = {
      "ppl": "ppl",
      "upper-lower": "ul",
      "full-body": "fb",
      "custom": "custom"
    };

    const mappedSplit = splitMapping[user.profile.workoutSplit] || "custom";

    const schedule = await ScheduleService.generateSchedule(
      userId,
      mappedSplit,
      user.profile.workoutDaysPerWeek
    );

    // ============================
    // GENERATE WORKOUTS FOR EACH SCHEDULE DAY
    // ============================
    const uniqueTypes = [...new Set(
      schedule.schedule
        .filter(s => s.workoutType)
        .map(s => s.workoutType)
    )];

    const workoutPromises = uniqueTypes.map(async type => {
      try {
        const plan = await ParallelAIService.generateWorkoutPlanParallel(
          user.profile,
          user.preferences,
          user.profile.workoutDaysPerWeek,
          type
        );
        return { type, plan };
      } catch {
        const plan = await OpenAIService.generateWorkoutPlan(
          user.profile,
          user.preferences,
          user.profile.workoutDaysPerWeek,
          type
        );
        return { type, plan };
      }
    });

    const workoutResults = await Promise.all(workoutPromises);

    // Create workouts + link to schedule
    for (const day of schedule.schedule) {
      if (!day.workoutType) continue;

      const match = workoutResults.find(
        r => r.type === day.workoutType
      );

      if (!match) continue;

      const workout = new Workout({
        userId,
        workoutType: day.workoutType,
        name: `${day.workoutType} Workout`,
        description: `Personalized ${day.workoutType} routine`,
        duration: user.profile.timePerWorkout,
        difficulty: user.profile.fitnessLevel,
        exercises: match.plan,
        scheduledDate: day.date,        // IMPORTANT: normalized date
        isCompleted: false,
        currentExerciseIndex: 0
      });

      await workout.save();
      day.workoutId = workout._id;
    }

    await schedule.save();

    // ============================
    // GENERATE PLAN EXPLANATION
    // ============================
    let planExplanation = null;
    try {
      const recentWorkouts = await Workout.find({ userId })
        .sort({ scheduledDate: -1 })
        .limit(5);

      planExplanation = await OpenAIService.generatePlanExplanation(
        user.profile,
        user.preferences,
        schedule,
        nutritionPlan,
        recentWorkouts
      );

      user.profile.planExplanation = planExplanation;
      await user.save();
    } catch (err) {
      console.log("Plan explanation generation failed:", err.message);
    }

    // ============================
    // RETURN RESULT
    // ============================
    return res.status(200).json({
      success: true,
      message: "Onboarding completed successfully",
      data: {
        user: {
          id: user._id,
          profile: user.profile,
          preferences: user.preferences
        },
        nutritionPlan: {
          id: nutritionPlan._id,
          meals: savedMeals
        },
        workoutSchedule: schedule.schedule,
        planExplanation
      }
    });

  } catch (err) {
    console.error("Onboarding error:", err);
    return res.status(500).json({
      success: false,
      message: "Onboarding failed",
      error: err.message
    });
  }
};

// Regenerate both daily workout and daily nutrition in one call
const regenerateFullPlan = async (req, res) => {
  // helper to call an existing controller without sending the real response
  const callHandler = (handler) =>
    new Promise((resolve, reject) => {
      const fakeRes = {
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(body) {
          if (this.statusCode && this.statusCode >= 400) {
            reject(new Error(body.message || 'Handler error'));
          } else {
            resolve(body);
          }
        },
      };

      handler(req, fakeRes).catch(reject);
    });

  try {
    // reuse your existing daily regeneration logic
    const workoutResult = await callHandler(regenerateDailyWorkout);
    const nutritionResult = await callHandler(regenerateDailyNutrition);

    return res.status(200).json({
      success: true,
      message: 'Full plan regenerated successfully',
      workout: workoutResult,
      nutrition: nutritionResult,
    });
  } catch (error) {
    console.error('Full plan regeneration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to regenerate full plan',
      error: error.message,
    });
  }
};

// Get user dashboard data
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get today's workout - try both methods
    let todaysWorkout = await Workout.getTodaysWorkout(userId);
    
    // If no workout found via static method, try direct query
    if (!todaysWorkout) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      todaysWorkout = await Workout.findOne({
        userId,
        scheduledDate: {
          $gte: today,
          $lt: tomorrow
        }
      }).sort({ scheduledDate: 1 }); // Get first workout of the day
    }

    // Get active nutrition plan with populated meals
    let activeNutritionPlan = await NutritionPlan.getActivePlan(userId);
    
    // If nutrition plan exists, ensure meals are populated
    if (activeNutritionPlan) {
      // Check if meals need to be populated
      if (activeNutritionPlan.meals && activeNutritionPlan.meals.length > 0) {
        const firstMeal = activeNutritionPlan.meals[0];
        if (typeof firstMeal === 'string' || firstMeal.toString().startsWith('ObjectId')) {
          await activeNutritionPlan.populate('meals');
        }
      }
    }

    // Get completed workouts count
    const completedWorkouts = await Workout.countDocuments({
      userId,
      isCompleted: true
    });

    // Calculate workout streak (simplified)
    const recentWorkouts = await Workout.find({
      userId,
      isCompleted: true
    }).sort({ completedAt: -1 }).limit(7);

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const workout of recentWorkouts) {
      const workoutDate = new Date(workout.completedAt);
      workoutDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: {
        todaysWorkout,
        activeNutritionPlan,
        stats: {
          workoutStreak: streak,
          totalWorkouts: completedWorkouts,
          weeklyGoal: req.user.profile.workoutDaysPerWeek
        }
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error.message
    });
  }
};

// Complete workout
const completeWorkout = async (req, res) => {
  try {
    const userId = req.user._id;
    const { workoutId } = req.params;

    const workout = await Workout.findOne({ _id: workoutId, userId });
    
    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    if (workout.isCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Workout already completed'
      });
    }

    // Check if workout is scheduled for today or earlier
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const workoutDate = new Date(workout.scheduledDate);
    workoutDate.setHours(0, 0, 0, 0);

    if (workoutDate > today) {
      return res.status(400).json({
        success: false,
        message: 'This workout is scheduled for a future date. You can only complete workouts on or after their scheduled date.'
      });
    }

    await workout.markCompleted();

    // Generate tomorrow's workout after completing current workout
    try {
      const user = await User.findById(userId);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      // Check if tomorrow's workout already exists
      const existingTomorrowWorkout = await Workout.findOne({
        userId,
        scheduledDate: {
          $gte: tomorrow,
          $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
        }
      });

      if (!existingTomorrowWorkout) {
        // Generate tomorrow's workout
        const tomorrowWorkout = await OpenAIService.generateWorkoutPlan(
          user.profile,
          user.preferences,
          1 // Generate for tomorrow only
        );

        if (tomorrowWorkout && tomorrowWorkout.length > 0) {
          const newWorkout = new Workout({
            userId,
            workoutType: tomorrowWorkout[0].workoutType || 'custom',
            name: tomorrowWorkout[0].name || 'Daily Workout',
            description: tomorrowWorkout[0].description || 'AI-generated workout',
            duration: tomorrowWorkout[0].duration || 60,
            difficulty: user.profile.fitnessLevel || 'intermediate',
            exercises: tomorrowWorkout[0].exercises || [],
            scheduledDate: tomorrow
          });

          await newWorkout.save();

          // Update workout schedule
          const workoutSchedule = await WorkoutSchedule.findOne({ userId });
          if (workoutSchedule) {
            const scheduleEntry = {
              date: tomorrow,
              workoutType: newWorkout.workoutType,
              isCompleted: false,
              workoutId: newWorkout._id
            };
            
            // Add to schedule if not already present
            const existingEntry = workoutSchedule.schedule.find(
              entry => new Date(entry.date).toDateString() === tomorrow.toDateString()
            );
            
            if (!existingEntry) {
              workoutSchedule.schedule.push(scheduleEntry);
              await workoutSchedule.save();
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating tomorrow\'s workout:', error);
      // Don't fail the workout completion if tomorrow's workout generation fails
    }

    // Get tomorrow's workout for preview
    let tomorrowWorkout = null;
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const existingTomorrowWorkout = await Workout.findOne({
        userId,
        scheduledDate: {
          $gte: tomorrow,
          $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
        }
      });

      if (existingTomorrowWorkout) {
        tomorrowWorkout = existingTomorrowWorkout;
      }
    } catch (error) {
      console.error('Error fetching tomorrow\'s workout:', error);
    }

    res.status(200).json({
      success: true,
      message: 'Workout completed successfully! 🎉',
      data: {
        completedWorkout: workout,
        tomorrowWorkoutPreview: tomorrowWorkout
      }
    });
  } catch (error) {
    console.error('Complete workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete workout',
      error: error.message
    });
  }
};

// Get nutrition plan
const getNutritionPlan = async (req, res) => {
  try {
    const userId = req.user._id;

    const nutritionPlan = await NutritionPlan.getActivePlan(userId);

    if (!nutritionPlan) {
      return res.status(404).json({
        success: false,
        message: 'No active nutrition plan found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Nutrition plan retrieved successfully',
      data: nutritionPlan
    });
  } catch (error) {
    console.error('Get nutrition plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get nutrition plan',
      error: error.message
    });
  }
};

// Get workout library
const getWorkoutLibrary = async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    
    // Mock workout library data (in a real app, this would come from a database)
    const workoutLibrary = [
      {
        id: 1,
        name: "Upper Body Strength",
        category: "Strength",
        duration: 45,
        difficulty: "Intermediate",
        equipment: ["Dumbbells", "Bench"],
        muscleGroups: ["Chest", "Back", "Shoulders", "Arms"],
        rating: 4.8,
        description: "Build upper body strength with compound movements",
        image: "💪",
      },
      {
        id: 2,
        name: "HIIT Cardio Blast",
        category: "Cardio",
        duration: 20,
        difficulty: "Advanced",
        equipment: ["Bodyweight"],
        muscleGroups: ["Full Body"],
        rating: 4.9,
        description: "High-intensity interval training for maximum calorie burn",
        image: "🔥",
      },
      {
        id: 3,
        name: "Lower Body Power",
        category: "Strength",
        duration: 50,
        difficulty: "Intermediate",
        equipment: ["Barbell", "Dumbbells"],
        muscleGroups: ["Legs", "Glutes"],
        rating: 4.7,
        description: "Develop explosive power in your legs and glutes",
        image: "🦵",
      },
      {
        id: 4,
        name: "Core & Stability",
        category: "Core",
        duration: 30,
        difficulty: "Beginner",
        equipment: ["Bodyweight", "Mat"],
        muscleGroups: ["Core", "Abs"],
        rating: 4.6,
        description: "Strengthen your core and improve stability",
        image: "⚡",
      },
      {
        id: 5,
        name: "Full Body Circuit",
        category: "Circuit",
        duration: 35,
        difficulty: "Intermediate",
        equipment: ["Dumbbells", "Kettlebells"],
        muscleGroups: ["Full Body"],
        rating: 4.8,
        description: "Complete full-body workout in circuit format",
        image: "🎯",
      },
      {
        id: 6,
        name: "Yoga Flow",
        category: "Flexibility",
        duration: 40,
        difficulty: "Beginner",
        equipment: ["Mat"],
        muscleGroups: ["Full Body"],
        rating: 4.5,
        description: "Improve flexibility and mental clarity",
        image: "🧘",
      },
    ];

    // Filter workouts based on query parameters
    let filteredWorkouts = workoutLibrary;

    if (category && category !== 'All') {
      filteredWorkouts = filteredWorkouts.filter(workout => workout.category === category);
    }

    if (difficulty && difficulty !== 'All') {
      filteredWorkouts = filteredWorkouts.filter(workout => workout.difficulty === difficulty);
    }

    if (search) {
      filteredWorkouts = filteredWorkouts.filter(workout => 
        workout.name.toLowerCase().includes(search.toLowerCase()) ||
        workout.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.status(200).json({
      success: true,
      message: 'Workout library retrieved successfully',
      data: {
        workouts: filteredWorkouts,
        total: filteredWorkouts.length,
        categories: ["All", "Strength", "Cardio", "Core", "Circuit", "Flexibility"],
        difficulties: ["All", "Beginner", "Intermediate", "Advanced"]
      }
    });
  } catch (error) {
    console.error('Get workout library error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get workout library',
      error: error.message
    });
  }
};

// Replace exercise in workout
const replaceExercise = async (req, res) => {
  try {
    const userId = req.user._id;
    const { workoutId, exerciseIndex, reason } = req.body;

    // Find the workout
    const workout = await Workout.findOne({ _id: workoutId, userId });
    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    // Get user profile for AI generation
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get the exercise to replace
    const exerciseToReplace = workout.exercises[exerciseIndex];
    if (!exerciseToReplace) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exercise index'
      });
    }

    // Generate replacement exercise using AI
    let replacementExercise;
    try {
      replacementExercise = await OpenAIService.generateReplacementExercise(
        exerciseToReplace,
        user.profile,
        user.preferences,
        reason
      );
    } catch (error) {
      console.log('AI exercise replacement failed, using fallback:', error.message);
      // Fallback replacement exercise - generate realistic alternatives based on muscle groups
      const muscleGroupAlternatives = {
        "chest": {
          name: "Incline Push-ups",
          description: "A variation of push-ups that targets the upper chest muscles",
          instructions: [
            "Step 1: Place your hands on an elevated surface (bench, step, or wall)",
            "Step 2: Position your body at an incline with feet on the ground",
            "Step 3: Lower your chest toward the surface, then push back up"
          ],
          tips: [
            "Keep your body straight throughout the movement",
            "Focus on squeezing your chest muscles at the top"
          ]
        },
        "shoulders": {
          name: "Pike Push-ups",
          description: "An advanced push-up variation that targets the shoulders",
          instructions: [
            "Step 1: Start in a downward dog position with hands shoulder-width apart",
            "Step 2: Lower your head toward the ground by bending your arms",
            "Step 3: Push back up to the starting position"
          ],
          tips: [
            "Keep your legs straight and core engaged",
            "Focus on the shoulder muscles doing the work"
          ]
        },
        "back": {
          name: "Reverse Plank",
          description: "A bodyweight exercise that strengthens the posterior chain",
          instructions: [
            "Step 1: Sit on the ground with legs extended and hands behind you",
            "Step 2: Lift your hips up to create a straight line from head to heels",
            "Step 3: Hold the position, then lower back down"
          ],
          tips: [
            "Keep your core tight throughout the movement",
            "Focus on squeezing your glutes and back muscles"
          ]
        },
        "legs": {
          name: "Jumping Lunges",
          description: "A dynamic lower body exercise that builds power and strength",
          instructions: [
            "Step 1: Start in a lunge position with one foot forward",
            "Step 2: Jump up and switch legs in mid-air",
            "Step 3: Land softly in a lunge position with the opposite leg forward"
          ],
          tips: [
            "Land softly on the balls of your feet",
            "Keep your core engaged throughout the movement"
          ]
        }
      };

      // Find the best alternative based on primary muscle group
      const primaryMuscle = exerciseToReplace.muscleGroups && exerciseToReplace.muscleGroups[0];
      const alternative = muscleGroupAlternatives[primaryMuscle] || muscleGroupAlternatives["chest"];
      
      replacementExercise = {
        name: alternative.name,
        description: alternative.description,
        sets: exerciseToReplace.sets,
        reps: exerciseToReplace.reps,
        weight: exerciseToReplace.weight,
        duration: exerciseToReplace.duration,
        restTime: exerciseToReplace.restTime,
        muscleGroups: exerciseToReplace.muscleGroups,
        equipment: exerciseToReplace.equipment,
        instructions: alternative.instructions,
        tips: alternative.tips
      };
    }

    // Replace the exercise
    workout.exercises[exerciseIndex] = replacementExercise;
    await workout.save();

    res.status(200).json({
      success: true,
      message: 'Exercise replaced successfully',
      data: {
        workout: workout,
        replacedExercise: replacementExercise
      }
    });
  } catch (error) {
    console.error('Replace exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to replace exercise',
      error: error.message
    });
  }
};

// Replace meal in nutrition plan
const replaceMeal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { mealId, reason } = req.body;

    // Find the meal
    const meal = await Meal.findOne({ _id: mealId, userId });
    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    // Get user profile for AI generation
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get active nutrition plan
    const nutritionPlan = await NutritionPlan.getActivePlan(userId);
    if (!nutritionPlan) {
      return res.status(404).json({
        success: false,
        message: 'No active nutrition plan found'
      });
    }

    // Generate replacement meal using AI
    let replacementMeal;
    try {
      replacementMeal = await OpenAIService.generateReplacementMeal(
        meal,
        user.profile,
        nutritionPlan.dailyCalorieTarget,
        user.profile.dietaryRestrictions,
        user.profile.allergies,
        reason
      );
    } catch (error) {
      console.log('AI meal replacement failed, using fallback:', error.message);
      // Fallback replacement meal - generate realistic alternatives based on meal type
      const mealTypeAlternatives = {
        "breakfast": {
          name: "Protein Smoothie Bowl",
          description: "A nutritious and filling breakfast bowl packed with protein and antioxidants",
          ingredients: [
            "1 scoop protein powder",
            "1 banana",
            "1/2 cup frozen berries",
            "1/2 cup Greek yogurt",
            "1 tbsp almond butter",
            "1 tbsp chia seeds",
            "1/4 cup granola"
          ],
          instructions: [
            "Step 1: Blend protein powder, banana, berries, and yogurt until smooth",
            "Step 2: Pour the smoothie into a bowl",
            "Step 3: Top with almond butter, chia seeds, and granola",
            "Step 4: Enjoy your protein-packed breakfast bowl!"
          ],
          dietaryTags: ["high-protein", "antioxidants"]
        },
        "lunch": {
          name: "Mediterranean Quinoa Bowl",
          description: "A fresh and healthy lunch bowl with Mediterranean flavors",
          ingredients: [
            "1 cup cooked quinoa",
            "1/2 cucumber, diced",
            "1/2 cup cherry tomatoes",
            "1/4 cup olives",
            "2 tbsp feta cheese",
            "1 tbsp olive oil",
            "1 tbsp lemon juice",
            "Fresh herbs (basil, oregano)"
          ],
          instructions: [
            "Step 1: Cook quinoa according to package instructions",
            "Step 2: Let quinoa cool, then mix with diced cucumber and tomatoes",
            "Step 3: Add olives and feta cheese",
            "Step 4: Dress with olive oil, lemon juice, and fresh herbs",
            "Step 5: Toss everything together and serve"
          ],
          dietaryTags: ["mediterranean", "fresh", "vegetarian"]
        },
        "dinner": {
          name: "Herb-Crusted Salmon",
          description: "A delicious and healthy dinner with omega-3 rich salmon",
          ingredients: [
            "6 oz salmon fillet",
            "2 tbsp fresh herbs (dill, parsley)",
            "1 tbsp olive oil",
            "1 lemon, sliced",
            "Salt and pepper to taste",
            "1 cup steamed vegetables"
          ],
          instructions: [
            "Step 1: Preheat oven to 400°F (200°C)",
            "Step 2: Season salmon with salt, pepper, and fresh herbs",
            "Step 3: Place salmon on a baking sheet with lemon slices",
            "Step 4: Bake for 12-15 minutes until cooked through",
            "Step 5: Serve with steamed vegetables"
          ],
          dietaryTags: ["high-protein", "omega-3", "low-carb"]
        },
        "snack": {
          name: "Apple Cinnamon Energy Balls",
          description: "A healthy and energizing snack perfect for any time of day",
          ingredients: [
            "1 cup dates, pitted",
            "1/2 cup almonds",
            "1 apple, grated",
            "1 tsp cinnamon",
            "1 tbsp coconut oil",
            "2 tbsp chia seeds"
          ],
          instructions: [
            "Step 1: Soak dates in warm water for 10 minutes",
            "Step 2: Blend dates, almonds, and grated apple in a food processor",
            "Step 3: Add cinnamon, coconut oil, and chia seeds",
            "Step 4: Roll mixture into small balls",
            "Step 5: Refrigerate for 30 minutes before serving"
          ],
          dietaryTags: ["energy-boosting", "natural-sweetness"]
        }
      };

      const alternative = mealTypeAlternatives[meal.mealType] || mealTypeAlternatives["lunch"];
      
      replacementMeal = {
        name: alternative.name,
        description: alternative.description,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        fiber: meal.fiber,
        ingredients: alternative.ingredients,
        instructions: alternative.instructions,
        prepTime: meal.prepTime,
        servings: meal.servings,
        mealType: meal.mealType,
        dietaryTags: alternative.dietaryTags
      };
    }

    // Update the meal
    Object.assign(meal, replacementMeal);
    await meal.save();

    res.status(200).json({
      success: true,
      message: 'Meal replaced successfully',
      data: {
        meal: meal,
        replacedMeal: replacementMeal
      }
    });
  } catch (error) {
    console.error('Replace meal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to replace meal',
      error: error.message
    });
  }
};

// Regenerate daily workout plan
const getWorkoutById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { workoutId } = req.params;

    const workout = await Workout.findOne({
      _id: workoutId,
      userId: userId
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    res.status(200).json({
      success: true,
      data: workout
    });
  } catch (error) {
    console.error('Get workout by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get workout',
      error: error.message
    });
  }
};

const regenerateDailyWorkout = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has complete profile
    if (!user.profile || !user.profile.age || !user.profile.weight || !user.profile.height) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile first by going through onboarding'
      });
    }

    // Generate new workout for today
    let exercises;
    try {
      exercises = await OpenAIService.generateWorkoutPlan(
        user.profile,
        user.preferences,
        1 // Generate for 1 day
      );
    } catch (error) {
      console.log('AI workout generation failed, using fallback data:', error.message);
      exercises = [
        {
          name: "Dynamic Push-ups",
          description: "Variation of traditional push-ups",
          sets: 3,
          reps: 12,
          weight: 0,
          duration: 0,
          restTime: 60,
          muscleGroups: ["chest", "triceps", "shoulders"],
          equipment: ["bodyweight"],
          instructions: [
            "Step 1: Start in plank position",
            "Step 2: Lower your chest to the ground",
            "Step 3: Push back up explosively"
          ],
          tips: [
            "Keep your body straight",
            "Engage your core throughout"
          ]
        },
        {
          name: "Jump Squats",
          description: "Explosive lower body exercise",
          sets: 3,
          reps: 15,
          weight: 0,
          duration: 0,
          restTime: 60,
          muscleGroups: ["quadriceps", "glutes", "calves"],
          equipment: ["bodyweight"],
          instructions: [
            "Step 1: Start in squat position",
            "Step 2: Jump up explosively",
            "Step 3: Land softly in squat position"
          ],
          tips: [
            "Land on the balls of your feet",
            "Keep your knees aligned with toes"
          ]
        }
      ];
    }

    // Create new workout for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const newWorkout = new Workout({
      userId,
      workoutType: 'custom', // Set default workout type
      name: `Daily Workout - ${tomorrow.toDateString()}`,
      description: `Fresh workout plan for ${user.profile.fitnessLevel} level`,
      duration: user.profile.timePerWorkout,
      difficulty: user.profile.fitnessLevel,
      exercises: exercises,
      scheduledDate: tomorrow,
      isCompleted: false
    });

    await newWorkout.save();

    // Update workout schedule to include tomorrow's workout
    const workoutSchedule = await WorkoutSchedule.findOne({ userId });
    if (workoutSchedule) {
      const scheduleEntry = {
        date: tomorrow,
        workoutType: newWorkout.workoutType || 'custom',
        isCompleted: false,
        workoutId: newWorkout._id
      };
      
      // Check if tomorrow's workout already exists in schedule
      const existingEntry = workoutSchedule.schedule.find(
        entry => new Date(entry.date).toDateString() === tomorrow.toDateString()
      );
      
      if (!existingEntry) {
        workoutSchedule.schedule.push(scheduleEntry);
        await workoutSchedule.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'New workout created for tomorrow',
      data: {
        workout: newWorkout
      }
    });
  } catch (error) {
    console.error('Regenerate daily workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate daily workout',
      error: error.message
    });
  }
};

// Regenerate daily nutrition plan
const regenerateDailyNutrition = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has complete profile
    if (!user.profile || !user.profile.age || !user.profile.weight || !user.profile.height) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile first by going through onboarding'
      });
    }

    // Calculate daily calorie target
    const dailyCalorieTarget = OpenAIService.calculateDailyCalorieTarget(user.profile);

    // Generate new meals for today
    let meals;
    try {
      meals = await OpenAIService.generateMealPlan(
        user.profile,
        dailyCalorieTarget,
        user.profile.dietaryRestrictions,
        user.profile.allergies
      );
    } catch (error) {
      console.log('AI meal generation failed, using fallback data:', error.message);
      meals = [
        {
          name: "Fresh Breakfast Bowl",
          description: "A new nutritious breakfast option.",
          calories: 600,
          protein: 30,
          carbs: 50,
          fat: 25,
          fiber: 10,
          ingredients: ["Fresh ingredients"],
          instructions: [
            "Step 1: Prepare fresh ingredients",
            "Step 2: Combine in bowl",
            "Step 3: Enjoy your fresh meal"
          ],
          prepTime: 15,
          servings: 1,
          mealType: "breakfast",
          dietaryTags: ["fresh", "nutritious"]
        }
      ];
    }

    // Save new meals
    const savedMeals = await Meal.insertMany(meals.map(meal => ({
      ...meal,
      userId
    })));

    // Update or create nutrition plan for today
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let nutritionPlan = await NutritionPlan.findOne({
      userId,
      startDate: { $lte: today },
      endDate: { $gte: today }
    });

    if (nutritionPlan) {
      // Update existing plan
      nutritionPlan.meals = savedMeals.map(meal => meal._id);
      nutritionPlan.dailyCalorieTarget = dailyCalorieTarget;
      nutritionPlan.macroTargets = {
        protein: Math.round(dailyCalorieTarget * 0.25 / 4),
        carbs: Math.round(dailyCalorieTarget * 0.45 / 4),
        fat: Math.round(dailyCalorieTarget * 0.30 / 9)
      };
      await nutritionPlan.save();
    } else {
      // Create new plan
      nutritionPlan = new NutritionPlan({
        userId,
        dailyCalorieTarget,
        macroTargets: {
          protein: Math.round(dailyCalorieTarget * 0.25 / 4),
          carbs: Math.round(dailyCalorieTarget * 0.45 / 4),
          fat: Math.round(dailyCalorieTarget * 0.30 / 9)
        },
        meals: savedMeals.map(meal => meal._id),
        startDate: today,
        endDate: tomorrow,
        isActive: true
      });
      await nutritionPlan.save();
    }

    res.status(200).json({
      success: true,
      message: 'Daily nutrition plan regenerated successfully',
      data: {
        nutritionPlan: nutritionPlan,
        meals: savedMeals
      }
    });
  } catch (error) {
    console.error('Regenerate daily nutrition error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate daily nutrition plan',
      error: error.message
    });
  }
};

// Get today's workout from schedule
// const getTodaysWorkout = async (req, res) => {
//   try {
//     const userId = req.user._id;
    
//     // Try to get workout directly first (faster)
//     let workout = await Workout.getTodaysWorkout(userId);
    
//     // If not found, try to get from schedule
//     if (!workout) {
//       const todaysSchedule = await ScheduleService.getTodaysWorkout(userId);
      
//       if (todaysSchedule && todaysSchedule.schedule) {
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         const tomorrow = new Date(today);
//         tomorrow.setDate(tomorrow.getDate() + 1);
        
//         const todaysScheduleItem = todaysSchedule.schedule.find(s => {
//           const scheduleDate = new Date(s.date);
//           scheduleDate.setHours(0, 0, 0, 0);
//           return scheduleDate.getTime() >= today.getTime() && scheduleDate.getTime() < tomorrow.getTime();
//         });

//         if (todaysScheduleItem && todaysScheduleItem.workoutId) {
//           workout = await Workout.findById(todaysScheduleItem.workoutId);
//         }
//       }
//     }

//     if (!workout) {
//       return res.status(200).json({
//         success: true,
//         message: 'No workout scheduled for today',
//         data: null
//       });
//     }

//     // Get progress and current exercise if methods exist
//     let progress = null;
//     let currentExercise = null;
//     try {
//       if (workout.getProgress) {
//         progress = workout.getProgress();
//       }
//       if (workout.getCurrentExercise) {
//         currentExercise = workout.getCurrentExercise();
//       }
//     } catch (err) {
//       // Methods might not exist, that's okay
//       console.log('Progress methods not available:', err.message);
//     }

//     res.status(200).json({
//       success: true,
//       data: workout
//     });
//   } catch (error) {
//     console.error('Get today\'s workout error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get today\'s workout',
//       error: error.message
//     });
//   }
// };

// =======================
// GET TODAY’S WORKOUT
// =======================

const getTodaysWorkout = async (req, res) => {
  try {
    const userId = req.user._id;

    const { today, tomorrow } = getTodayRange();

    // 1️⃣ Try direct workout lookup
    let workout = await Workout.findOne({
      userId,
      scheduledDate: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // 2️⃣ If not found, look inside user's schedule
    if (!workout) {
      const schedule = await WorkoutSchedule.findOne({ userId });

      if (schedule) {
        const entry = schedule.schedule.find(s =>
          normalize(s.date).getTime() === today.getTime()
        );

        if (entry?.workoutId) {
          workout = await Workout.findById(entry.workoutId);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: workout ? "Workout found" : "No workout scheduled",
      data: workout || null
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to get today's workout",
      error: err.message
    });
  }
};

// Get weekly schedule
const getWeeklySchedule = async (req, res) => {
  try {
    const userId = req.user._id;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date();
    
    const weeklySchedule = await ScheduleService.getWeeklySchedule(userId, startDate);
    
    if (!weeklySchedule) {
      return res.status(404).json({
        success: false,
        message: 'No schedule found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        schedule: weeklySchedule.schedule,
        splitType: weeklySchedule.splitType,
        startDate: weeklySchedule.startDate
      }
    });
  } catch (error) {
    console.error('Get weekly schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get weekly schedule'
    });
  }
};

// Complete current exercise and move to next
const completeCurrentExercise = async (req, res) => {
  try {
    const { workoutId } = req.params;
    const userId = req.user._id;

    const workout = await Workout.findOne({ _id: workoutId, userId });
    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    await workout.completeCurrentExercise();
    const progress = workout.getProgress();
    const currentExercise = workout.getCurrentExercise();

    res.status(200).json({
      success: true,
      message: 'Exercise completed successfully',
      data: {
        progress,
        currentExercise,
        isWorkoutCompleted: workout.isCompleted
      }
    });
  } catch (error) {
    console.error('Complete exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete exercise'
    });
  }
};

// Get current exercise
const getCurrentExercise = async (req, res) => {
  try {
    const { workoutId } = req.params;
    const userId = req.user._id;

    const workout = await Workout.findOne({ _id: workoutId, userId });
    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    const currentExercise = workout.getCurrentExercise();
    const progress = workout.getProgress();

    res.status(200).json({
      success: true,
      data: {
        currentExercise,
        progress,
        isWorkoutCompleted: workout.isCompleted
      }
    });
  } catch (error) {
    console.error('Get current exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get current exercise'
    });
  }
};

// Get workout progress
const getWorkoutProgress = async (req, res) => {
  try {
    const { workoutId } = req.params;
    const userId = req.user._id;

    const workout = await Workout.findOne({ _id: workoutId, userId });
    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    const progress = workout.getProgress();

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Get workout progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get workout progress'
    });
  }
};

// Get comprehensive plan overview
const getPlanOverview = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get workout schedule
    const workoutSchedule = await WorkoutSchedule.findOne({ userId });
    
    // Get nutrition plan
    const nutritionPlan = await NutritionPlan.getActivePlan(userId);
    
    // Get recent workouts (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentWorkouts = await Workout.find({
      userId,
      scheduledDate: { $gte: sevenDaysAgo },
      isCompleted: true
    }).sort({ scheduledDate: -1 });

    // Calculate stats
    const totalWorkoutsCompleted = await Workout.countDocuments({
      userId,
      isCompleted: true
    });

    const currentStreak = await calculateWorkoutStreak(userId);
    const weeklyGoal = user.profile?.workoutDaysPerWeek || 3;
    const weeklyProgress = recentWorkouts.length;

    // Get upcoming workouts (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingWorkouts = await Workout.find({
      userId,
      scheduledDate: { 
        $gte: new Date(),
        $lte: nextWeek
      },
      isCompleted: false
    }).sort({ scheduledDate: 1 });

    res.json({
      success: true,
      data: {
        user: {
          name: `${user.firstName} ${user.lastName}`,
          fitnessLevel: user.profile?.fitnessLevel,
          goals: user.profile?.goals || [],
          weight: user.profile?.weight,
          height: user.profile?.height
        },
        stats: {
          totalWorkoutsCompleted,
          currentStreak,
          weeklyGoal,
          weeklyProgress,
          weeklyPercentage: Math.round((weeklyProgress / weeklyGoal) * 100)
        },
        workoutSchedule: workoutSchedule ? {
          splitType: workoutSchedule.splitType,
          schedule: workoutSchedule.schedule.slice(0, 7) // Next 7 days
        } : null,
        nutritionPlan: nutritionPlan ? {
          dailyCalorieTarget: nutritionPlan.dailyCalorieTarget,
          macroTargets: nutritionPlan.macroTargets,
          mealCount: nutritionPlan.meals.length
        } : null,
        recentWorkouts: recentWorkouts.slice(0, 5), // Last 5 workouts
        upcomingWorkouts: upcomingWorkouts.slice(0, 7) // Next 7 workouts
      }
    });
  } catch (error) {
    console.error('Get plan overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get plan overview',
      error: error.message
    });
  }
};

// Helper function to calculate workout streak
const calculateWorkoutStreak = async (userId) => {
  try {
    const workouts = await Workout.find({
      userId,
      isCompleted: true
    }).sort({ scheduledDate: -1 });

    if (workouts.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < workouts.length; i++) {
      const workoutDate = new Date(workouts[i].scheduledDate);
      workoutDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today - workoutDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Calculate streak error:', error);
    return 0;
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const profileData = req.body;

    // Validate required fields
    if (!profileData.age || !profileData.weight || !profileData.height) {
      return res.status(400).json({
        success: false,
        message: 'Age, weight, and height are required'
      });
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          'profile.age': profileData.age,
          'profile.weight': profileData.weight,
          'profile.height': profileData.height,
          'profile.gender': profileData.gender,
          'profile.fitnessLevel': profileData.fitnessLevel,
          'profile.goals': profileData.goals,
          'profile.workoutDaysPerWeek': profileData.workoutDaysPerWeek,
          'profile.workoutSplit': profileData.workoutSplit,
          'profile.timePerWorkout': profileData.timePerWorkout,
          'profile.dietaryRestrictions': profileData.dietaryRestrictions || [],
          'profile.allergies': profileData.allergies || []
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if key profile data changed that affects plans
    const keyFieldsChanged = [
      'weight', 'height', 'age', 'gender', 'fitnessLevel', 'goals',
      'workoutDaysPerWeek', 'workoutSplit', 'timePerWorkout',
      'dietaryRestrictions', 'allergies'
    ].some(field => profileData[field] !== undefined);

    // If workout split or days changed, regenerate schedule
    if (profileData.workoutSplit || profileData.workoutDaysPerWeek) {
      // Map frontend split values to backend enum values
      const splitMapping = {
        'ppl': 'ppl',
        'upper-lower': 'ul',
        'full-body': 'fb',
        'custom': 'custom'
      };
      
      const currentSplit = profileData.workoutSplit || updatedUser.profile.workoutSplit;
      const mappedSplit = splitMapping[currentSplit] || 'custom';
      
      await ScheduleService.updateSchedule(
        userId,
        mappedSplit,
        profileData.workoutDaysPerWeek || updatedUser.profile.workoutDaysPerWeek
      );
    }

    // If nutrition-related data changed, regenerate nutrition plan
    if (profileData.weight || profileData.height || profileData.age || 
        profileData.gender || profileData.goals || profileData.dietaryRestrictions || 
        profileData.allergies) {
      try {
        // Calculate new daily calorie target
        const dailyCalorieTarget = OpenAIService.calculateDailyCalorieTarget(updatedUser.profile);
        
        // Generate new nutrition plan
        const newNutritionPlan = await OpenAIService.generateMealPlan(
          updatedUser.profile,
          updatedUser.preferences,
          dailyCalorieTarget
        );

        if (newNutritionPlan && newNutritionPlan.length > 0) {
          // Deactivate current nutrition plan
          await NutritionPlan.updateMany(
            { userId, isActive: true },
            { isActive: false }
          );

          // Create new nutrition plan
          const nutritionPlan = new NutritionPlan({
            userId,
            dailyCalorieTarget,
            macroTargets: newNutritionPlan[0].macroTargets,
            meals: newNutritionPlan[0].meals.map(meal => meal._id),
            isActive: true
          });

          await nutritionPlan.save();
        }
      } catch (error) {
        console.error('Error regenerating nutrition plan:', error);
        // Don't fail the profile update if nutrition plan regeneration fails
      }
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Chat with AI agent
const chatWithAI = async (req, res) => {
  try {
    const userId = req.user._id;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's plans
    const workoutSchedule = await WorkoutSchedule.findOne({ userId });
    const nutritionPlan = await NutritionPlan.findOne({ userId, isActive: true });

    const userPlans = {
      workoutSchedule,
      nutritionPlan
    };

    // Get AI response
    const aiResponse = await ChatService.getUserChatResponse(message, user, userPlans);

    res.json({
      success: true,
      data: {
        response: aiResponse,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Chat with AI error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI response',
      error: error.message
    });
  }
};

// Get comprehensive plan overview with AI explanation
const getComprehensivePlanOverview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { regenerate } = req.query; // Add regenerate parameter
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's workout schedule and nutrition plan
    const workoutSchedule = await WorkoutSchedule.findOne({ userId, isActive: true });
    const nutritionPlan = await NutritionPlan.findOne({ userId, isActive: true });
    const recentWorkouts = await Workout.find({ userId })
      .sort({ scheduledDate: -1 })
      .limit(5);

    // Get stored plan explanation or generate if not available
    let planExplanation = user.profile.planExplanation;
    
    // If no stored explanation OR regenerate is requested, generate a new one
    if (!planExplanation || regenerate === 'true') {
      try {
        planExplanation = await OpenAIService.generatePlanExplanation(
          user.profile,
          user.preferences,
          workoutSchedule,
          nutritionPlan,
          recentWorkouts
        );
        // Store it for future use
        user.profile.planExplanation = planExplanation;
        await user.save();
      } catch (error) {
        console.error('Error generating plan explanation:', error);
        planExplanation = "Plan explanation is being generated. Please refresh the page in a moment.";
      }
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          profile: user.profile,
          preferences: user.preferences
        },
        workoutSchedule: workoutSchedule,
        nutritionPlan: nutritionPlan,
        recentWorkouts: recentWorkouts,
        planExplanation: planExplanation
      }
    });
  } catch (error) {
    console.error('Get comprehensive plan overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get plan overview',
      error: error.message
    });
  }
};

module.exports = {
  completeOnboarding,
  getDashboard,
  completeWorkout,
  getNutritionPlan,
  getWorkoutLibrary,
  replaceExercise,
  replaceMeal,
  regenerateDailyWorkout,
  regenerateDailyNutrition,
  regenerateFullPlan,
  getTodaysWorkout,
  getWeeklySchedule,
  completeCurrentExercise,
  getCurrentExercise,
  getWorkoutProgress,
  getWorkoutById,
  getPlanOverview,
  getComprehensivePlanOverview,
  chatWithAI,
  updateProfile
};
