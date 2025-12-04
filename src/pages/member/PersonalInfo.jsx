import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, ChevronLeft, ChevronRight } from "lucide-react";
import { onboardingStorage } from "../../utils/onboardingStorage";

const PersonalInfo = () => {
  const navigate = useNavigate();
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  // Load saved data
  useEffect(() => {
    const saved = onboardingStorage.getAll();
    if (saved.age) setAge(saved.age);
    if (saved.gender) setGender(saved.gender);
    if (saved.height) setHeight(saved.height);
    if (saved.weight) setWeight(saved.weight);
  }, []);

  const handlePersonalInfo = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!age || !gender || !height || !weight) {
      alert("Please fill in all fields before continuing.");
      return;
    }

    // Validate numeric values
    const ageNum = Number(age);
    const heightNum = Number(height);
    const weightNum = Number(weight);

    if (ageNum < 13 || ageNum > 120) {
      alert("Age must be between 13 and 120.");
      return;
    }

    if (heightNum < 100 || heightNum > 250) {
      alert("Height must be between 100 and 250 cm.");
      return;
    }

    if (weightNum < 30 || weightNum > 300) {
      alert("Weight must be between 30 and 300 kg.");
      return;
    }

    // Save to localStorage
    onboardingStorage.save('age', age);
    onboardingStorage.save('gender', gender);
    onboardingStorage.save('height', height);
    onboardingStorage.save('weight', weight);
    
    console.log('Personal info saved:', { age, gender, height, weight });
    navigate("/member/fitnessGoal");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <User className="w-8 h-8" />
            Personal Info
          </h1>
          <p className="text-gray-400">Tell us about yourself</p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
          <form onSubmit={handlePersonalInfo} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Age */}
              <div className="flex flex-col">
                <label htmlFor="age" className="text-sm text-gray-400 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter your age"
                  className="px-4 py-2 bg-gray-700 text-gray-100 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  required
                />
              </div>

              {/* Gender */}
              <div className="flex flex-col">
                <label htmlFor="gender" className="text-sm text-gray-400 mb-1">
                  Gender
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="px-4 py-2 bg-gray-700 text-gray-100 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  required
                >
                  <option value="">Select your gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Height */}
              <div className="flex flex-col">
                <label htmlFor="height" className="text-sm text-gray-400 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  id="height"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Enter your height"
                  className="px-4 py-2 bg-gray-700 text-gray-100 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  required
                />
              </div>

              {/* Weight */}
              <div className="flex flex-col">
                <label htmlFor="weight" className="text-sm text-gray-400 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter your weight"
                  className="px-4 py-2 bg-gray-700 text-gray-100 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  required
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
