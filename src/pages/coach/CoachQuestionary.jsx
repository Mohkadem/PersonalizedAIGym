import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, getAuthToken } from "../../services/api";
import { Target } from "lucide-react";

const CoachQuestionary = () => {
  const navigate = useNavigate();
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const ageNum = Number(age);
    const heightNum = Number(height);
    const weightNum = Number(weight);

    if (!ageNum || !heightNum || !weightNum || !speciality.trim() || !gender) {
      setError("Please fill in all fields with valid values.");
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        setError("Not authenticated. Please log in again.");
        return;
      }

      const specializationArray = speciality
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await authAPI.updateProfile(token, {
        profile: {
          age: ageNum,
          height: heightNum,
          weight: weightNum,
          gender,
        },
        coachProfile: {
          specialization: specializationArray,
        },
      });

      if (!res.success) {
        throw new Error(res.message || "Failed to save coach information");
      }

      navigate("/coach");
    } catch (err) {
      console.error("Coach questionnaire error:", err);
      setError(err.message || "Failed to save coach information.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center gap-2">
            <Target className="w-8 h-8" />
            Coach Profile Setup
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Tell us a bit about yourself so we can set up your coach profile.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-sm text-gray-400 mb-1">Age</label>
              <input
                type="number"
                min="18"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 30"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-400 mb-1">Height (cm)</label>
              <input
                type="number"
                min="100"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 180"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-400 mb-1">Weight (kg)</label>
              <input
                type="number"
                min="30"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 75"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-400 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="px-4 py-2 bg-gray-700 text-gray-100 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-400 mb-1">
              Speciality (comma separated)
            </label>
            <input
              type="text"
              value={speciality}
              onChange={(e) => setSpeciality(e.target.value)}
              className="px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. strength-training, cardio, nutrition"
              required
            />
          </div>

          {error && (
            <div className="px-3 py-2 bg-red-900/30 text-red-300 rounded text-sm border border-red-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`mt-2 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Saving..." : "Finish Setup"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CoachQuestionary;
