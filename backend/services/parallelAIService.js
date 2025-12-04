const OpenAIService = require('./openai');

/**
 * Parallel AI Processing Service
 * Uses divide and conquer approach to generate workout and nutrition plans in parallel
 * This improves accuracy by having specialized prompts for different aspects
 */
class ParallelAIService {
  /**
   * Generate workout plan using parallel processing
   * Divides the workout generation into specialized tasks
   */
  static async generateWorkoutPlanParallel(userProfile, preferences, workoutDaysPerWeek, workoutType = 'custom') {
    try {
      console.log('=== PARALLEL WORKOUT GENERATION ===');
      
      // Divide workout generation into parallel tasks
      const [warmupExercises, mainExercises, cooldownExercises] = await Promise.all([
        // Task 1: Generate warmup exercises
        this.generateWarmupExercises(userProfile, preferences),
        
        // Task 2: Generate main workout exercises (most important)
        this.generateMainExercises(userProfile, preferences, workoutDaysPerWeek, workoutType),
        
        // Task 3: Generate cooldown/stretch exercises
        this.generateCooldownExercises(userProfile, preferences)
      ]);

      // Merge all exercises into one workout plan
      const completeWorkout = [
        ...warmupExercises,
        ...mainExercises,
        ...cooldownExercises
      ];

      console.log('Parallel generation complete. Total exercises:', completeWorkout.length);
      return completeWorkout;
    } catch (error) {
      console.error('Parallel workout generation error:', error);
      // Fallback to sequential generation
      return await OpenAIService.generateWorkoutPlan(userProfile, preferences, workoutDaysPerWeek, workoutType);
    }
  }

  /**
   * Generate warmup exercises in parallel
   */
  static async generateWarmupExercises(userProfile, preferences) {
    try {
      const prompt = `Generate 1-2 warmup exercises for a ${userProfile.fitnessLevel} level user.
      Age: ${userProfile.age}, Gender: ${userProfile.gender}
      Equipment available: ${(userProfile.availableEquipment || []).join(', ')}
      Goal: ${(userProfile.goals || []).join(', ')}
      
      Return JSON array with: name, type: "warmup", duration (seconds), instructions, tips, muscleGroups, equipment.
      Focus on dynamic movements and mobility.`;

      const response = await this.callOpenAI(prompt, 'warmup');
      return this.parseExerciseResponse(response, 'warmup');
    } catch (error) {
      console.error('Warmup generation error:', error);
      return [{
        name: "Dynamic Warm-up",
        type: "warmup",
        duration: 300,
        restTime: 0,
        exerciseType: "warmup",
        muscleGroups: ["full-body"],
        equipment: ["bodyweight"],
        instructions: ["5 minutes of light movement", "Arm circles", "Leg swings"],
        tips: ["Start slow", "Gradually increase range of motion"]
      }];
    }
  }

  /**
   * Generate main exercises in parallel (most important part)
   */
  static async generateMainExercises(userProfile, preferences, workoutDaysPerWeek, workoutType) {
    try {
      // Use the existing detailed workout generation but focus on main exercises
      const detailedPlan = await OpenAIService.generateDetailedWorkoutPlan(
        userProfile,
        preferences,
        workoutDaysPerWeek,
        workoutType
      );
      
      const structuredPlan = await OpenAIService.convertPlanToJSON(detailedPlan, workoutType);
      
      // Filter to only main exercises (not warmup/cooldown)
      return structuredPlan.filter(ex => ex.type === 'exercise');
    } catch (error) {
      console.error('Main exercises generation error:', error);
      return OpenAIService.generateTemplateWorkout(userProfile, preferences, workoutDaysPerWeek, workoutType);
    }
  }

  /**
   * Generate cooldown exercises in parallel
   */
  static async generateCooldownExercises(userProfile, preferences) {
    try {
      const prompt = `Generate 1 cooldown/stretch routine for a ${userProfile.fitnessLevel} level user.
      Age: ${userProfile.age}, Gender: ${userProfile.gender}
      Focus on: ${(userProfile.goals || []).join(', ')}
      
      Return JSON array with: name, type: "cooldown", duration (seconds), instructions, tips, muscleGroups.
      Include stretches for major muscle groups worked.`;

      const response = await this.callOpenAI(prompt, 'cooldown');
      return this.parseExerciseResponse(response, 'cooldown');
    } catch (error) {
      console.error('Cooldown generation error:', error);
      return [{
        name: "Cool Down Stretch",
        type: "cooldown",
        duration: 600,
        restTime: 0,
        exerciseType: "cooldown",
        muscleGroups: ["full-body"],
        equipment: ["bodyweight"],
        instructions: ["10 minutes of static stretching", "Hold each stretch 30 seconds"],
        tips: ["Breathe deeply", "Don't bounce"]
      }];
    }
  }

  /**
   * Generate nutrition plan using parallel processing
   * Divides meal generation by meal type
   */
  static async generateMealPlanParallel(userProfile, dailyCalorieTarget, dietaryRestrictions, allergies) {
    try {
      console.log('=== PARALLEL MEAL GENERATION ===');
      
      // Calculate calories per meal (assuming 3 main meals + 1 snack)
      const caloriesPerMeal = Math.round(dailyCalorieTarget / 4);
      
      // Generate meals in parallel by meal type
      const [breakfast, lunch, dinner, snack] = await Promise.all([
        this.generateMealByType(userProfile, 'breakfast', caloriesPerMeal, dietaryRestrictions, allergies),
        this.generateMealByType(userProfile, 'lunch', caloriesPerMeal, dietaryRestrictions, allergies),
        this.generateMealByType(userProfile, 'dinner', caloriesPerMeal, dietaryRestrictions, allergies),
        this.generateMealByType(userProfile, 'snack', Math.round(caloriesPerMeal * 0.5), dietaryRestrictions, allergies)
      ]);

      // Merge all meals
      const allMeals = [breakfast, lunch, dinner, snack].filter(Boolean);
      
      console.log('Parallel meal generation complete. Total meals:', allMeals.length);
      return allMeals;
    } catch (error) {
      console.error('Parallel meal generation error:', error);
      // Fallback to sequential generation
      return await OpenAIService.generateMealPlan(userProfile, dailyCalorieTarget, dietaryRestrictions, allergies);
    }
  }

  /**
   * Generate a specific meal type
   */
  static async generateMealByType(userProfile, mealType, targetCalories, dietaryRestrictions, allergies) {
    try {
      const prompt = `Generate 1 ${mealType} meal for a ${userProfile.fitnessLevel} level user.
      Target calories: ${targetCalories}
      Age: ${userProfile.age}, Gender: ${userProfile.gender}
      Goals: ${(userProfile.goals || []).join(', ')}
      Dietary restrictions: ${(dietaryRestrictions || []).join(', ') || 'None'}
      Allergies: ${(allergies || []).join(', ') || 'None'}
      
      Return JSON object with: name, description, calories, protein, carbs, fat, fiber, ingredients (array), 
      instructions (array), prepTime (minutes), servings, mealType: "${mealType}", dietaryTags (array).
      Ensure total calories are approximately ${targetCalories}.`;

      const response = await this.callOpenAI(prompt, mealType);
      return this.parseMealResponse(response);
    } catch (error) {
      console.error(`${mealType} generation error:`, error);
      return null; // Will be handled by fallback
    }
  }

  /**
   * Call OpenAI API with a specific prompt
   */
  static async callOpenAI(prompt, context = 'general') {
    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: "system",
          content: `You are an expert ${context === 'warmup' ? 'warmup and mobility' : context === 'cooldown' ? 'stretching and recovery' : 'nutrition and meal planning'} specialist. 
          Generate accurate, evidence-based ${context} recommendations. Always return valid JSON.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    });

    return response.choices[0].message.content.trim();
  }

  /**
   * Parse exercise response from AI
   */
  static parseExerciseResponse(response, type) {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return Array.isArray(parsed) ? parsed : [parsed];
      }
      
      // If no array found, try single object
      const objMatch = response.match(/\{[\s\S]*\}/);
      if (objMatch) {
        return [JSON.parse(objMatch[0])];
      }
      
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Parse exercise error:', error);
      return [];
    }
  }

  static cleanMealMacros(meal) {
    const cleanNumber = (val) => {
      if (typeof val === "number") return val;
      if (typeof val === "string") {
        // Remove "g", "kcal", "cal", "grams", whitespace, etc.
        const cleaned = val.replace(/[^\d.]/g, "");
        return Number(cleaned) || 0;
      }
      return 0;
    };

    return {
      ...meal,
      calories: cleanNumber(meal.calories),
      protein: cleanNumber(meal.protein),
      carbs: cleanNumber(meal.carbs),
      fat: cleanNumber(meal.fat),
      fiber: cleanNumber(meal.fiber),
    };
  }

  /**
   * Parse meal response from AI
   */
  // static parseMealResponse(response) {
  //   try {
  //     // Try to extract JSON from response
  //     const jsonMatch = response.match(/\{[\s\S]*\}/);
  //     if (jsonMatch) {
  //       return JSON.parse(jsonMatch[0]);
  //     }
      
  //     throw new Error('No valid JSON found in response');
  //   } catch (error) {
  //     console.error('Parse meal error:', error);
  //     return null;
  //   }
  // }
  // Robust JSON extractor for OpenAI responses
  static parseMealResponse(rawText) {
    try {
      // STEP 1: Extract the first valid JSON block using bracket matching
      const extractJSON = (text) => {
        const start = text.indexOf("{");
        if (start === -1) throw new Error("No JSON object found");

        let depth = 0;
        let end = start;

        for (let i = start; i < text.length; i++) {
          if (text[i] === "{") depth++;
          if (text[i] === "}") depth--;

          if (depth === 0) {
            end = i;
            break;
          }
        }

        const jsonString = text.substring(start, end + 1);

        return jsonString;
      };

      let jsonString = extractJSON(rawText);

      // STEP 2: Remove trailing commas inside arrays or objects
      jsonString = jsonString.replace(/,\s*([}\]])/g, "$1");

      // STEP 3: Parse the cleaned JSON
      let parsed = JSON.parse(jsonString);

      // STEP 4: Clean macros
      if (Array.isArray(parsed)) {
        return parsed.map(meal => this.cleanMealMacros(meal));
      } else {
        return this.cleanMealMacros(parsed);
      }
    } catch (err) {
      console.error("Final meal parse failure:", err);
      console.error("RAW MEAL AI OUTPUT:", rawText);
      throw new Error("Failed to parse meal JSON");
    }
  }
}

module.exports = ParallelAIService;

