const express = require('express');
const router = express.Router();
const coachController = require('../controllers/coachController');
const auth = require('../middleware/auth');

// All coach routes require coach authentication
router.use(auth.authenticateToken);
router.use(auth.requireRole('coach'));

// Dashboard
router.get('/dashboard/stats', coachController.getDashboardStats);
router.get('/clients', coachController.getClients);
router.get('/clients/:clientId', coachController.getClientDetails);

// Workout management
router.put('/clients/:clientId/workouts/:workoutId', coachController.editClientWorkout);
router.post('/clients/:clientId/workouts', coachController.addCustomWorkout);

// Update client profile and plans
router.put('/clients/:clientId/profile', coachController.updateClientProfile);
router.put('/clients/:clientId/workout-plan', coachController.updateClientWorkoutPlan);
router.put('/clients/:clientId/nutrition-plan', coachController.updateClientNutritionPlan);
router.post('/clients/:clientId/regenerate-plan', coachController.regenerateClientPlan);
router.put('/clients/:clientId/workout-schedule', coachController.updateClientWorkoutSchedule);

// Add comments
router.post('/clients/:clientId/workouts/:workoutId/exercises/:exerciseId/comments', coachController.addExerciseComment);
router.post('/clients/:clientId/meals/:mealId/comments', coachController.addMealComment);

// AI Chat
router.post('/clients/:clientId/chat', coachController.chatWithAI);

// Coach profile
router.put('/profile', coachController.updateCoachProfile);

module.exports = router;
