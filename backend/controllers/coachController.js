const User = require('../models/User');
const WorkoutSchedule = require('../models/WorkoutSchedule');
const NutritionPlan = require('../models/NutritionPlan');
const Workout = require('../models/Workout');
const Meal = require('../models/Meal');
const OpenAIService = require('../services/openai');
const ScheduleService = require('../services/scheduleService');
const ChatService = require('../services/chatService');

class CoachController {
  // Get coach's clients
  // Get coach's clients
  async getClients(req, res) {
    try {
      const coachId = req.user.id;
      const coach = await User.findById(coachId).populate({
        path: 'coachProfile.clients',
        select: 'firstName lastName email profile preferences isActive createdAt',
        populate: {
          path: 'profile',
          select: 'age weight height gender fitnessLevel goals'
        }
      });

      if (!coach) {
        return res.status(404).json({
          success: false,
          message: 'Coach not found'
        });
      }

      const clients = coach.coachProfile.clients || [];
      const clientIds = clients.map((c) => c._id);

      // Preload nutrition plans and workouts for summary counts
      const [activePlans, workouts] = await Promise.all([
        NutritionPlan.find({
          userId: { $in: clientIds },
          isActive: true,
        }).select('userId'),
        Workout.find({
          userId: { $in: clientIds },
        }).select('userId isCompleted'),
      ]);

      const activePlansMap = {};
      activePlans.forEach((plan) => {
        const key = String(plan.userId);
        activePlansMap[key] = (activePlansMap[key] || 0) + 1;
      });

      const workoutCountsMap = {};
      workouts.forEach((workout) => {
        const key = String(workout.userId);
        if (!workoutCountsMap[key]) {
          workoutCountsMap[key] = { total: 0, completed: 0 };
        }
        workoutCountsMap[key].total += 1;
        if (workout.isCompleted) {
          workoutCountsMap[key].completed += 1;
        }
      });

      const enrichedClients = clients.map((client) => {
        const id = String(client._id);
        const clientObj = client.toObject();
        return {
          ...clientObj,
          activePlansCount: activePlansMap[id] || 0,
          workoutCounts: workoutCountsMap[id] || { total: 0, completed: 0 },
        };
      });

      res.json({
        success: true,
        data: enrichedClients,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching clients',
        error: error.message
      });
    }
  }

  // Get client details
  async getClientDetails(req, res) {
    try {
      const { clientId } = req.params;
      const coachId = req.user.id;

      const coach = await User.findById(coachId);
      if (!coach.coachProfile.clients.includes(clientId)) {
        return res.status(403).json({
          success: false,
          message: 'You are not assigned to this client'
        });
      }

      const client = await User.findById(clientId)
        .select('-password')
        .populate('profile preferences');

      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      // Get client's workout schedule and nutrition plan
      const workoutSchedule = await WorkoutSchedule.findOne({ userId: clientId });
      const nutritionPlan = await NutritionPlan.findOne({ userId: clientId });

      // Get all workouts for this client
      const workouts = await Workout.find({ userId: clientId }).sort({
        date: 1,
        createdAt: 1,
      });

      const meals = await Meal.find({ userId: clientId });


      res.json({
        success: true,
        data: {
          client,
          workoutSchedule,
          nutritionPlan,
          nutritionPlans: nutritionPlan ? [nutritionPlan] : [],
          workouts,
          meals,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching client details',
        error: error.message
      });
    }
  }

  // Update client's workout schedule
  async updateClientWorkoutSchedule(req, res) {
    try {
      const { clientId } = req.params;
      const { workouts } = req.body;
      const coachId = req.user.id;

      const coach = await User.findById(coachId);
      if (!coach.coachProfile.clients.includes(clientId)) {
        return res.status(403).json({
          success: false,
          message: 'You are not assigned to this client'
        });
      }

      const workoutSchedule = await WorkoutSchedule.findOne({ userId: clientId });
      if (!workoutSchedule) {
        return res.status(404).json({
          success: false,
          message: 'Workout schedule not found'
        });
      }

      // Update workouts
      workoutSchedule.workouts = workouts;
      workoutSchedule.lastModifiedBy = coachId;
      workoutSchedule.lastModifiedAt = new Date();

      await workoutSchedule.save();

      res.json({
        success: true,
        message: 'Workout schedule updated successfully',
        data: workoutSchedule
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating workout schedule',
        error: error.message
      });
    }
  }

  // Update client's nutrition plan
  async updateClientNutritionPlan(req, res) {
    try {
      const { clientId } = req.params;
      const { meals } = req.body;
      const coachId = req.user.id;

      const coach = await User.findById(coachId);
      if (!coach.coachProfile.clients.includes(clientId)) {
        return res.status(403).json({
          success: false,
          message: 'You are not assigned to this client'
        });
      }

      const nutritionPlan = await NutritionPlan.findOne({ userId: clientId });
      if (!nutritionPlan) {
        return res.status(404).json({
          success: false,
          message: 'Nutrition plan not found'
        });
      }

      // Update meals
      nutritionPlan.meals = meals;
      nutritionPlan.lastModifiedBy = coachId;
      nutritionPlan.lastModifiedAt = new Date();

      await nutritionPlan.save();

      res.json({
        success: true,
        message: 'Nutrition plan updated successfully',
        data: nutritionPlan
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating nutrition plan',
        error: error.message
      });
    }
  }

  // Add comment to exercise
  async addExerciseComment(req, res) {
    try {
      const { clientId, workoutId, exerciseId } = req.params;
      const { comment } = req.body;
      const coachId = req.user.id;

      const coach = await User.findById(coachId);
      if (!coach.coachProfile.clients.includes(clientId)) {
        return res.status(403).json({
          success: false,
          message: 'You are not assigned to this client'
        });
      }

      const workout = await Workout.findById(workoutId);
      if (!workout) {
        return res.status(404).json({
          success: false,
          message: 'Workout not found'
        });
      }

      const exercise = workout.exercises.id(exerciseId);
      if (!exercise) {
        return res.status(404).json({
          success: false,
          message: 'Exercise not found'
        });
      }

      // Add coach comment
      if (!exercise.coachComments) {
        exercise.coachComments = [];
      }

      exercise.coachComments.push({
        coachId,
        comment,
        createdAt: new Date()
      });

      await workout.save();

      res.json({
        success: true,
        message: 'Comment added successfully',
        data: exercise.coachComments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error adding comment',
        error: error.message
      });
    }
  }

  // Add comment to meal
  async addMealComment(req, res) {
    try {
      const { clientId, mealId } = req.params;
      const { comment } = req.body;
      const coachId = req.user.id;

      const coach = await User.findById(coachId);
      if (!coach.coachProfile.clients.includes(clientId)) {
        return res.status(403).json({
          success: false,
          message: 'You are not assigned to this client'
        });
      }

      const meal = await Meal.findById(mealId);
      if (!meal) {
        return res.status(404).json({
          success: false,
          message: 'Meal not found'
        });
      }

      // Add coach comment
      if (!meal.coachComments) {
        meal.coachComments = [];
      }

      meal.coachComments.push({
        coachId,
        comment,
        createdAt: new Date()
      });

      await meal.save();

      res.json({
        success: true,
        message: 'Comment added successfully',
        data: meal.coachComments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error adding comment',
        error: error.message
      });
    }
  }

  // Get coach dashboard stats
  async getDashboardStats(req, res) {
    try {
      const coachId = req.user.id;
      const coach = await User.findById(coachId).populate('coachProfile.clients');

      const totalClients = coach.coachProfile.clients.length;
      const activeClients = coach.coachProfile.clients.filter(client => client.isActive).length;

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentWorkouts = await Workout.countDocuments({
        userId: { $in: coach.coachProfile.clients.map(c => c._id) },
        createdAt: { $gte: sevenDaysAgo }
      });

      const coachInfo = {
        firstName: coach.firstName,
        lastName: coach.lastName,
        email: coach.email,
      };

      res.json({
        success: true,
        data: {
          totalClients,
          activeClients,
          recentWorkouts,
          coachProfile: coach.coachProfile,
          coach: coachInfo,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard stats',
        error: error.message
      });
    }
  }

  // Update coach profile
  async updateCoachProfile(req, res) {
    try {
      const coachId = req.user.id;
      const { specialization, experience, bio } = req.body;

      const coach = await User.findById(coachId);
      if (!coach) {
        return res.status(404).json({
          success: false,
          message: 'Coach not found'
        });
      }

      coach.coachProfile.specialization = specialization || coach.coachProfile.specialization;
      coach.coachProfile.experience = experience !== undefined ? experience : coach.coachProfile.experience;
      coach.coachProfile.bio = bio || coach.coachProfile.bio;

      await coach.save();

      res.json({
        success: true,
        message: 'Coach profile updated successfully',
        data: coach.coachProfile
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating coach profile',
        error: error.message
      });
    }
  }

  // Update client profile (goals, splits, weights, etc.)
  async updateClientProfile(req, res) {
    try {
      const { clientId } = req.params;
      const profileData = req.body;
      const coachId = req.user.id;

      // Verify coach has access to this client
      const coach = await User.findById(coachId);
      if (!coach.coachProfile.clients.includes(clientId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this client'
        });
      }

      // Update client profile
      const updatedClient = await User.findByIdAndUpdate(
        clientId,
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

      if (!updatedClient) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      // Regenerate plans if key data changed
      if (profileData.workoutSplit || profileData.workoutDaysPerWeek) {
        const splitMapping = {
          'ppl': 'ppl',
          'upper-lower': 'ul',
          'full-body': 'fb',
          'custom': 'custom'
        };
        
        const mappedSplit = splitMapping[profileData.workoutSplit] || 'custom';
        
        await ScheduleService.updateSchedule(
          clientId,
          mappedSplit,
          profileData.workoutDaysPerWeek || updatedClient.profile.workoutDaysPerWeek
        );
      }

      // Regenerate nutrition plan if nutrition-related data changed
      if (profileData.weight || profileData.height || profileData.age || 
          profileData.gender || profileData.goals || profileData.dietaryRestrictions || 
          profileData.allergies) {
        try {
          const dailyCalorieTarget = OpenAIService.calculateDailyCalorieTarget(updatedClient.profile);
          
          const newNutritionPlan = await OpenAIService.generateMealPlan(
            updatedClient.profile,
            updatedClient.preferences,
            dailyCalorieTarget
          );

          if (newNutritionPlan && newNutritionPlan.length > 0) {
            await NutritionPlan.updateMany(
              { userId: clientId, isActive: true },
              { isActive: false }
            );

            const nutritionPlan = new NutritionPlan({
              userId: clientId,
              dailyCalorieTarget,
              macroTargets: newNutritionPlan[0].macroTargets,
              meals: newNutritionPlan[0].meals.map(meal => meal._id),
              isActive: true
            });

            await nutritionPlan.save();
          }
        } catch (error) {
          console.error('Error regenerating nutrition plan:', error);
        }
      }

      res.json({
        success: true,
        message: 'Client profile updated successfully',
        data: {
          client: updatedClient
        }
      });
    } catch (error) {
      console.error('Update client profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update client profile',
        error: error.message
      });
    }
  }

  // Update client workout plan
  async updateClientWorkoutPlan(req, res) {
    try {
      const { clientId } = req.params;
      const { workoutData } = req.body;
      const coachId = req.user.id;

      // Verify coach has access to this client
      const coach = await User.findById(coachId);
      if (!coach.coachProfile.clients.includes(clientId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this client'
        });
      }

      // Update workout schedule
      const workoutSchedule = await WorkoutSchedule.findOne({ userId: clientId });
      if (workoutSchedule) {
        workoutSchedule.splitType = workoutData.splitType;
        workoutSchedule.schedule = workoutData.schedule;
        await workoutSchedule.save();
      }

      res.json({
        success: true,
        message: 'Client workout plan updated successfully'
      });
    } catch (error) {
      console.error('Update client workout plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update client workout plan',
        error: error.message
      });
    }
  }

  // Update client nutrition plan
  async updateClientNutritionPlan(req, res) {
    try {
      const { clientId } = req.params;
      const { nutritionData } = req.body;
      const coachId = req.user.id;

      // Verify coach has access to this client
      const coach = await User.findById(coachId);
      if (!coach.coachProfile.clients.includes(clientId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this client'
        });
      }

      // Update nutrition plan
      const nutritionPlan = await NutritionPlan.findOne({ userId: clientId, isActive: true });
      if (nutritionPlan) {
        nutritionPlan.dailyCalorieTarget = nutritionData.dailyCalorieTarget;
        nutritionPlan.macroTargets = nutritionData.macroTargets;
        await nutritionPlan.save();
      }

      res.json({
        success: true,
        message: 'Client nutrition plan updated successfully'
      });
    } catch (error) {
      console.error('Update client nutrition plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update client nutrition plan',
        error: error.message
      });
    }
  }

  // Chat with AI agent about a specific client
  async chatWithAI(req, res) {
    try {
      const { clientId } = req.params;
      const { message } = req.body;
      const coachId = req.user.id;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Message is required'
        });
      }

      // Verify coach has access to this client
      const coach = await User.findById(coachId);
      if (!coach.coachProfile.clients.includes(clientId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this client'
        });
      }

      // Get client data
      const client = await User.findById(clientId);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      // Get client's plans
      const workoutSchedule = await WorkoutSchedule.findOne({ userId: clientId });
      const nutritionPlan = await NutritionPlan.findOne({ userId: clientId, isActive: true });

      const clientPlans = {
        workoutSchedule,
        nutritionPlan
      };

      // Get AI response
      const aiResponse = await ChatService.getCoachChatResponse(message, client, clientPlans, coach);

      res.json({
        success: true,
        data: {
          response: aiResponse,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Coach chat with AI error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get AI response',
        error: error.message
      });
    }
  }

  // Edit client workout
  async editClientWorkout(req, res) {
    try {
      const { clientId, workoutId } = req.params;
      const workoutData = req.body;
      const coachId = req.user.id;

      // Verify coach has access to this client
      const coach = await User.findById(coachId);
      if (!coach || !coach.coachProfile.clients.includes(clientId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this client'
        });
      }

      // Find and update the workout
      const workout = await Workout.findOneAndUpdate(
        { _id: workoutId, userId: clientId },
        { 
          ...workoutData,
          isCoachEdited: true, // Mark as coach-edited so AI doesn't override
          lastEditedBy: coachId,
          lastEditedAt: new Date()
        },
        { new: true }
      );

      if (!workout) {
        return res.status(404).json({
          success: false,
          message: 'Workout not found'
        });
      }

      res.json({
        success: true,
        message: 'Workout updated successfully',
        data: workout
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating workout',
        error: error.message
      });
    }
  }

  // Add custom workout for client
  async addCustomWorkout(req, res) {
    try {
      const { clientId } = req.params;
      const workoutData = req.body;
      const coachId = req.user.id;

      // Verify coach has access to this client
      const coach = await User.findById(coachId);
      if (!coach || !coach.coachProfile.clients.includes(clientId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this client'
        });
      }

      // Create new custom workout
      const workout = new Workout({
        userId: clientId,
        ...workoutData,
        isCoachEdited: true, // Mark as coach-created
        createdBy: coachId,
        createdAt: new Date()
      });

      await workout.save();

      // Update workout schedule
      const workoutSchedule = await WorkoutSchedule.findOne({ userId: clientId });
      if (workoutSchedule) {
        const scheduleEntry = {
          date: workoutData.scheduledDate || new Date(),
          workoutType: workoutData.workoutType || 'custom',
          isCompleted: false,
          workoutId: workout._id
        };
        
        workoutSchedule.schedule.push(scheduleEntry);
        await workoutSchedule.save();
      }

      res.status(201).json({
        success: true,
        message: 'Custom workout added successfully',
        data: workout
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error adding custom workout',
        error: error.message
      });
    }
  }

  // Regenerate client's entire plan based on new goals/splits
  async regenerateClientPlan(req, res) {
    try {
      const { clientId } = req.params;
      const { goals, workoutSplit, fitnessLevel, timePerWorkout } = req.body;
      const coachId = req.user.id;

      // Verify coach has access to this client
      const coach = await User.findById(coachId);
      if (!coach || !coach.coachProfile.clients.includes(clientId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this client'
        });
      }

      // Get client
      const client = await User.findById(clientId);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      // Update client profile with new goals/splits
      const updatedProfile = {
        ...client.profile,
        goals: goals || client.profile.goals,
        workoutSplit: workoutSplit || client.profile.workoutSplit,
        fitnessLevel: fitnessLevel || client.profile.fitnessLevel,
        timePerWorkout: timePerWorkout || client.profile.timePerWorkout
      };

      client.profile = updatedProfile;
      await client.save();

      // Generate new workout schedule (only for non-coach-edited workouts)
      const workoutSchedule = await WorkoutSchedule.findOne({ userId: clientId });
      if (workoutSchedule) {
        // Remove AI-generated workouts (keep coach-edited ones)
        const coachEditedWorkouts = await Workout.find({
          userId: clientId,
          isCoachEdited: true
        });

        // Delete AI-generated workouts
        await Workout.deleteMany({
          userId: clientId,
          isCoachEdited: { $ne: true }
        });

        // Generate new AI workout schedule
        const newSchedule = await ScheduleService.generateSchedule(
          updatedProfile,
          client.preferences,
          7 // Generate 7 days ahead
        );

        // Update workout schedule
        workoutSchedule.splitType = newSchedule.splitType;
        workoutSchedule.schedule = newSchedule.schedule;
        await workoutSchedule.save();
      }

      // Regenerate nutrition plan if goals changed
      if (goals && goals !== client.profile.goals) {
        try {
          const dailyCalorieTarget = OpenAIService.calculateDailyCalorieTarget(updatedProfile);
          const newNutritionPlan = await OpenAIService.generateMealPlan(
            updatedProfile,
            client.preferences,
            dailyCalorieTarget
          );

          if (newNutritionPlan && newNutritionPlan.length > 0) {
            // Deactivate old nutrition plan
            await NutritionPlan.updateMany(
              { userId: clientId, isActive: true },
              { isActive: false }
            );

            // Create new nutrition plan
            const nutritionPlan = new NutritionPlan({
              userId: clientId,
              dailyCalorieTarget,
              macroTargets: newNutritionPlan[0].macroTargets,
              meals: newNutritionPlan[0].meals.map(meal => meal._id),
              isActive: true
            });

            await nutritionPlan.save();
          }
        } catch (error) {
          console.error('Error regenerating nutrition plan:', error);
        }
      }

      res.json({
        success: true,
        message: 'Client plan regenerated successfully',
        data: {
          profile: updatedProfile,
          workoutSchedule: workoutSchedule,
          coachEditedWorkouts: coachEditedWorkouts.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error regenerating client plan',
        error: error.message
      });
    }
  }
}

module.exports = new CoachController();
