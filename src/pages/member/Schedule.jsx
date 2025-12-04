import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Calendar,
  Clock,
  Layout,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { onboardingStorage } from "../../utils/onboardingStorage";
import { authAPI, getAuthToken } from "../../services/api";

const daysOptions = [
  "2 days",
  "3 days",
  "4 days",
  "5 days",
  "6 days",
  "7 days",
];

const sessionOptions = [
  "30 minutes",
  "45 minutes",
  "60 minutes",
  "75 minutes",
  "90 minutes",
];

const splitOptions = [
  "Full body",
  "Upper / Lower",
  "Push / Pull / Legs",
  "Bro split (Chest, Back, Shoulders, Arms, Legs)",
  "Body part focused",
];

const splitLabelFromCode = {
  fb: "Full body",
  ul: "Upper / Lower",
  ppl: "Push / Pull / Legs",
  custom: "Body part focused",
};

const splitCodeFromLabel = {
  "Full body": "fb",
  "Upper / Lower": "ul",
  "Push / Pull / Legs": "ppl",
  "Bro split (Chest, Back, Shoulders, Arms, Legs)": "custom",
  "Body part focused": "custom",
};

const toDaysLabel = (n) => (n ? `${n} days` : "");
const toMinutesLabel = (n) => (n ? `${n} minutes` : "");

const extractNumber = (str, fallback) => {
  if (!str) return fallback;
  const match = str.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : fallback;
};

const Schedule = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.state?.mode === "edit";

  const [daysPerWeek, setDaysPerWeek] = useState("");
  const [sessionLength, setSessionLength] = useState("");
  const [workoutSplit, setWorkoutSplit] = useState("");
  const [profile, setProfile] = useState(null); // backend profile for edit mode
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load data: onboardingStorage for onboarding, backend profile for edit
  useEffect(() => {
    const init = async () => {
      if (isEditMode) {
        try {
          const token = getAuthToken();
          if (!token) return;

          const res = await authAPI.getProfile(token);
          if (res.success && res.data?.user?.profile) {
            const p = res.data.user.profile;
            setProfile(p);

            setDaysPerWeek(toDaysLabel(p.workoutDaysPerWeek));
            setSessionLength(toMinutesLabel(p.timePerWorkout));
            setWorkoutSplit(splitLabelFromCode[p.workoutSplit] || "");
          }
        } catch (err) {
          console.error("Failed to load profile for schedule edit:", err);
        }
      } else {
        const saved = onboardingStorage.getAll();
        if (saved.daysPerWeek) setDaysPerWeek(saved.daysPerWeek);
        if (saved.sessionLength) setSessionLength(saved.sessionLength);
        if (saved.workoutSplit) setWorkoutSplit(saved.workoutSplit);
      }
    };

    init();
  }, [isEditMode]);

  const canContinue = !!daysPerWeek && !!sessionLength && !!workoutSplit;

  const handleNextOnboarding = () => {
    onboardingStorage.save("daysPerWeek", daysPerWeek);
    onboardingStorage.save("sessionLength", sessionLength);
    onboardingStorage.save("workoutSplit", workoutSplit);
    navigate("/member/preferences");
  };

  const handleSaveEdit = async () => {
    if (!canContinue) return false;

    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();
      if (!token) {
        setError("Not authenticated. Please log in again.");
        return false;
      }

      const days = extractNumber(daysPerWeek, profile?.workoutDaysPerWeek || 3);
      const minutes = extractNumber(
        sessionLength,
        profile?.timePerWorkout || 60
      );
      const splitCode =
        splitCodeFromLabel[workoutSplit] || profile?.workoutSplit || "fb";

      const updatedProfile = {
        ...(profile || {}),
        workoutDaysPerWeek: days,
        timePerWorkout: minutes,
        workoutSplit: splitCode,
      };

      const res = await authAPI.updateProfile(token, {
        profile: updatedProfile,
      });

      if (!res.success) {
        throw new Error(res.message || "Failed to update workout schedule");
      }

      // regenerate full plan with new schedule
      await authAPI.regenerateFullPlan(token);

      return true;
    } catch (err) {
      console.error("Update schedule error:", err);
      setError(err.message || "Failed to save changes.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            {isEditMode ? "Edit Workout Schedule" : "Workout Schedule"}
          </h1>
          <p className="text-gray-400">
            {isEditMode
              ? "Adjust how often you train and how your week is structured."
              : "Customize your workout routine."}
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 space-y-6">
          {/* Question 1 — days per week */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              How many days per week can you workout?
            </h2>
            <select
              value={daysPerWeek || ""}
              onChange={(e) => setDaysPerWeek(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="" disabled>
                Select days per week
              </option>
              {daysOptions.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          {/* Question 2 — session length */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              How long will each workout session be?
            </h2>
            <div className="space-y-2">
              {sessionOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => setSessionLength(option)}
                  className={`p-3 cursor-pointer transition rounded-lg border ${
                    sessionLength === option
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-650"
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>

          {/* Question 3 — workout split */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Layout className="w-5 h-5" />
              How would you like to split your workouts?
            </h2>
            <div className="space-y-2">
              {splitOptions.map((split) => (
                <div
                  key={split}
                  onClick={() => setWorkoutSplit(split)}
                  className={`p-3 cursor-pointer transition rounded-lg border ${
                    workoutSplit === split
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-650"
                  }`}
                >
                  {split}
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

          {/* Navigation Buttons */}
          {/* Button block */}
          <div className="flex justify-between pt-4 border-t border-gray-700">
            <button
              onClick={() =>
                isEditMode
                  ? navigate("/member/landingPage")
                  : navigate("/member/fitnessGoal")
              }
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              {isEditMode ? "Cancel" : "Previous"}
            </button>
            <button
              disabled={!canContinue || loading}
              onClick={async () => {
                if (isEditMode) {
                  await handleSaveEdit(); // <-- IMPORTANT
                  navigate("/member/landingPage");
                } else {
                  handleNextOnboarding();
                }
              }}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                canContinue && !loading
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
            >
              {isEditMode ? "Save changes" : "Next"}
              {!isEditMode && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
