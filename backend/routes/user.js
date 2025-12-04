const express = require('express');
const rateLimit = require('express-rate-limit');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Rate limiting for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 AI requests per minute
  message: {
    success: false,
    message: 'Too many AI requests, please try again later.'
  }
});

// Onboarding
router.post('/onboarding', userController.completeOnboarding);

// Dashboard
router.get('/dashboard', userController.getDashboard);
router.get('/plan-overview', userController.getPlanOverview);
router.get('/comprehensive-plan', userController.getComprehensivePlanOverview);

// AI Chat
router.post('/chat', aiLimiter, userController.chatWithAI);

// Workouts
router.get('/workouts/:workoutId', userController.getWorkoutById);
router.post('/workouts/:workoutId/complete', userController.completeWorkout);

// Nutrition
router.get('/nutrition/plan', userController.getNutritionPlan);

// Workout Library
router.get('/workouts/library', userController.getWorkoutLibrary);

// Exercise and Meal Replacement (with AI rate limiting)
router.post('/workouts/replace-exercise', aiLimiter, userController.replaceExercise);
router.post('/meals/replace-meal', aiLimiter, userController.replaceMeal);

// Daily Regeneration (with AI rate limiting)
router.post('/workouts/regenerate-daily', aiLimiter, userController.regenerateDailyWorkout);
router.post('/nutrition/regenerate-daily', aiLimiter, userController.regenerateDailyNutrition);
router.post("/regenerate-full-plan", authenticate, userController.regenerateFullPlan);

// Calendar and schedule routes
router.get('/schedule/weekly', userController.getWeeklySchedule);
router.get('/schedule/today', userController.getTodaysWorkout);

// Exercise progression routes
router.post('/workouts/:workoutId/complete-exercise', userController.completeCurrentExercise);
router.get('/workouts/:workoutId/current-exercise', userController.getCurrentExercise);
router.get('/workouts/:workoutId/progress', userController.getWorkoutProgress);

// Profile management
router.put('/profile', userController.updateProfile);


module.exports = router;
