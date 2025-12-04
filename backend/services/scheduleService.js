// backend/services/scheduleService.js
const WorkoutSchedule = require("../models/WorkoutSchedule");
const { normalize } = require("../utils/date");

class ScheduleService {

  static async generateSchedule(userId, splitType, daysPerWeek) {

    const today = normalize(new Date());

    const schedule = [];

    for (let i = 0; i < daysPerWeek; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      date.setHours(0, 0, 0, 0);

      schedule.push({
        date,
        workoutType: this.getWorkoutTypeForDay(i, splitType, daysPerWeek),
        isCompleted: false,
        workoutId: null
      });
    }

    let existing = await WorkoutSchedule.findOne({ userId });

    if (!existing) {
      existing = new WorkoutSchedule({
        userId,
        splitType,
        startDate: today,                            // REQUIRED
        endDate: new Date(today.getTime() + 7*86400000), // REQUIRED
        schedule,
        isActive: true                               // REQUIRED
      });
    } else {
      existing.splitType = splitType;
      existing.startDate = today;                    // REQUIRED
      existing.endDate = new Date(today.getTime() + 7*86400000);
      existing.schedule = schedule;
      existing.isActive = true;
    }

    await existing.save();
    return existing;
  }

  static getWorkoutTypeForDay(i, split, daysPerWeek) {
    if (i >= daysPerWeek) return null;

    if (split === "ppl") return ["push", "pull", "legs"][i % 3];
    if (split === "ul") return ["upper", "lower"][i % 2];
    if (split === "fb") return "fullbody";
    return "custom";
  }
}

module.exports = ScheduleService;
