import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Target, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { onboardingStorage } from "../../utils/onboardingStorage";
import { authAPI, getAuthToken } from "../../services/api";

const goalOptions = [
  "Lose weight",
  "Build muscle",
  "Improve endurance",
  "General fitness",
  "Increase strength",
];

const levelOptions = [
  "Beginner (0-6 months experience)",
  "Intermediate (6 months - 2 years)",
  "Advanced (2+ years)",
];

const goalCodeFromLabel = {
  "Lose weight": "lose-weight",
  "Build muscle": "build-muscle",
  "Improve endurance": "improve-endurance",
  "General fitness": "general-fitness",
  "Increase strength": "build-muscle",
};

const goalLabelFromCode = {
  "lose-weight": "Lose weight",
  "build-muscle": "Build muscle",
  "improve-endurance": "Improve endurance",
  "general-fitness": "General fitness",
};

const levelCodeFromLabel = {
  "Beginner (0-6 months experience)": "beginner",
  "Intermediate (6 months - 2 years)": "intermediate",
  "Advanced (2+ years)": "advanced",
};

const levelLabelFromCode = {
  beginner: "Beginner (0-6 months experience)",
  intermediate: "Intermediate (6 months - 2 years)",
  advanced: "Advanced (2+ years)",
};

const FitnessGoal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.state?.mode === "edit";

  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [profile, setProfile] = useState(null); // full backend profile in edit mode
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load data: onboardingStorage for onboarding, backend profile for edit mode
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

            // map backend codes to labels
            if (p.goals && p.goals.length > 0) {
              const gCode = p.goals[0];
              setSelectedGoal(goalLabelFromCode[gCode] || "General fitness");
            }
            if (p.fitnessLevel) {
              setSelectedLevel(
                levelLabelFromCode[p.fitnessLevel] ||
                  "Beginner (0-6 months experience)"
              );
            }
          }
        } catch (err) {
          console.error("Failed to load profile for edit:", err);
        }
      } else {
        const saved = onboardingStorage.getAll();
        if (saved.selectedGoal) setSelectedGoal(saved.selectedGoal);
        if (saved.fitnessLevel) setSelectedLevel(saved.fitnessLevel);
      }
    };

    init();
  }, [isEditMode]);

  const handleNextOnboarding = () => {
    onboardingStorage.save("selectedGoal", selectedGoal);
    onboardingStorage.save("fitnessLevel", selectedLevel);
    navigate("/member/schedule");
  };

  // const handleSaveEdit = async () => {
  //   if (!selectedGoal || !selectedLevel) return;

  //   try {
  //     setLoading(true);
  //     setError("");

  //     const token = getAuthToken();
  //     if (!token) {
  //       setError("Not authenticated. Please log in again.");
  //       return;
  //     }

  //     const goalCode =
  //       goalCodeFromLabel[selectedGoal] || "general-fitness";
  //     const levelCode =
  //       levelCodeFromLabel[selectedLevel] || "beginner";

  //     const updatedProfile = {
  //       ...(profile || {}),
  //       goals: [goalCode],
  //       fitnessLevel: levelCode,
  //     };

  //     const res = await authAPI.updateProfile(token, {
  //       profile: updatedProfile,
  //     });

  //     if (!res.success) {
  //       throw new Error(res.message || "Failed to update fitness goal");
  //     }

  //     navigate("/member"); // back to main dashboard
  //   } catch (err) {
  //     console.error("Update fitness goal error:", err);
  //     setError(err.message || "Failed to save changes.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();
      if (!token) {
        setError("Not authenticated. Please log in again.");
        return;
      }

      const goalCode = goalCodeFromLabel[selectedGoal] || "general-fitness";
      const levelCode = levelCodeFromLabel[selectedLevel] || "beginner";

      // 1) Update profile in backend
      const updatedProfile = {
        ...(profile || {}),
        goals: [goalCode],
        fitnessLevel: levelCode,
      };

      const res = await authAPI.updateProfile(token, {
        profile: updatedProfile,
      });

      if (!res.success) {
        throw new Error(res.message || "Failed to update fitness goal");
      }

      // 2) Regenerate workout + nutrition plans
      await authAPI.regenerateFullPlan(token);

      // 3) Redirect to landing page
      navigate("/member/landingPage");
    } catch (err) {
      console.error("Update fitness goal error:", err);
      setError(err.message || "Failed to save changes.");
    } finally {
      setLoading(false);
    }
  };

  const canContinue = !!selectedGoal && !!selectedLevel;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Target className="w-8 h-8" />
            {isEditMode ? "Edit Fitness Goals" : "Fitness Goals"}
          </h1>
          <p className="text-gray-400">
            {isEditMode
              ? "Update your fitness goals and level. This will influence your future plans."
              : "Tell us about your fitness objectives."}
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 space-y-6">
          {/* Fitness Goal Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              What's your primary fitness goal?
            </h2>
            <div className="space-y-2">
              {goalOptions.map((goal) => (
                <div
                  key={goal}
                  onClick={() => setSelectedGoal(goal)}
                  className={`p-3 cursor-pointer transition rounded-lg border ${
                    selectedGoal === goal
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-650"
                  }`}
                >
                  {goal}
                </div>
              ))}
            </div>
          </div>

          {/* Fitness Level Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              What's your current fitness level?
            </h2>
            <div className="space-y-2">
              {levelOptions.map((level) => (
                <div
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`p-3 cursor-pointer transition rounded-lg border ${
                    selectedLevel === level
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-650"
                  }`}
                >
                  {level}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm mt-2">
              {error}
            </p>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-700">
            <button
              onClick={() =>
                isEditMode ? navigate("/member/landingPage") : navigate("/member/questionary")
              }
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              {isEditMode ? "Cancel" : "Previous"}
            </button>

            <button
              disabled={!canContinue || loading}
              onClick={isEditMode ? handleSaveEdit : handleNextOnboarding}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                canContinue && !loading
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
            >
              {isEditMode ? (loading ? "Saving..." : "Save changes") : "Next"}
              {!isEditMode && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FitnessGoal;
