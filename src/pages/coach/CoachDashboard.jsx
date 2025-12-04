import React, { useState, useEffect } from "react";
import {
  Users,
  Mail,
  Target,
  Activity,
  Calendar,
  UtensilsCrossed,
  MessageSquare,
  Edit,
  X,
  ChevronLeft,
} from "lucide-react";
import { coachAPI, getAuthToken } from "../../services/api";

const CoachDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clientLoading, setClientLoading] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      const token = getAuthToken();
      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      try {
        const stats = await coachAPI.getDashboardStats(token);
        const clientsRes = await coachAPI.getClients(token);

        if (stats.success && clientsRes.success) {
          setDashboardData({
            ...stats.data,
            clients: clientsRes.data,
          });
        } else {
          setError("Failed to load coach dashboard");
        }
      } catch (err) {
        setError("An error occurred while loading dashboard");
        console.error("Coach dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleClientClick = async (clientData) => {
    try {
      setClientLoading(true);
      setError("");

      const token = getAuthToken();
      const client = clientData.client || clientData;
      const clientId = client._id;

      const response = await coachAPI.getClientDetails(token, clientId);

      if (response.success && response.data) {
        setSelectedClient(response.data);
      } else {
        setError(response.message || "Failed to load client details");
      }
    } catch (err) {
      console.error("Error loading client details:", err);
      setError("An error occurred while loading client details");
    } finally {
      setClientLoading(false);
    }
  };


  const handleBackToList = () => {
    setSelectedClient(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Not Authenticated</h1>
          <p className="text-gray-400">Please sign in to access the coach dashboard.</p>
        </div>
      </div>
    );
  }

  if (selectedClient) {
    return (
      <ClientDetailView
        client={selectedClient}
        onBack={handleBackToList}
      />
    );
  }

  const clients = dashboardData.clients || [];
  const coach = dashboardData.coach || {};

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 px-3 py-2 bg-red-900/30 text-red-300 rounded text-sm border border-red-800">
            {error}
          </div>
        )}
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Coach Dashboard</h1>
          <p className="text-gray-400">
            Welcome back, {coach.firstName} {coach.lastName}
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Clients ({clients.length})
            </h2>
          </div>

          {clients.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No clients assigned yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-750 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Fitness Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Goals
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Active Plans
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Workouts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {clients.map((clientData) => {
                    const client = clientData.client || clientData;
                    const activePlans =
                      clientData.activePlansCount ??
                      (clientData.nutritionPlans || []).filter((p) => p.isActive).length;

                    const totalWorkouts =
                      clientData.workoutCounts?.total ??
                      (clientData.workouts || []).length;

                    const completedWorkouts =
                      clientData.workoutCounts?.completed ??
                      (clientData.workouts || []).filter((w) => w.isCompleted).length;

                    return (
                      <tr
                        key={client._id}
                        onClick={() => handleClientClick(clientData)}
                        className="hover:bg-gray-750 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-100">
                                {client.firstName} {client.lastName}
                              </div>
                              <div className="text-sm text-gray-400 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {client.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-900/30 text-blue-300 capitalize">
                            {client.profile?.fitnessLevel || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {(client.profile?.goals || []).slice(0, 2).map((goal) => (
                              <span
                                key={goal}
                                className="px-2 py-1 text-xs rounded-full bg-purple-900/30 text-purple-300 capitalize"
                              >
                                {goal.replace("-", " ")}
                              </span>
                            ))}
                            {(client.profile?.goals || []).length > 2 && (
                              <span className="px-2 py-1 text-xs text-gray-400">
                                +{(client.profile?.goals || []).length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex items-center gap-1">
                            <UtensilsCrossed className="w-4 h-4" />
                            {activePlans} active
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex items-center gap-1">
                            <Activity className="w-4 h-4" />
                            {completedWorkouts}/{totalWorkouts}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              client.isActive
                                ? "bg-green-900/30 text-green-300"
                                : "bg-gray-700 text-gray-400"
                            }`}
                          >
                            {client.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ClientDetailView = ({ client, onBack }) => {
  // client is the full clientData object from getClientDetails
  const clientData = client;

  const clientUser = clientData.client || clientData;

  const workouts = clientData.workouts || [];
  const completedWorkouts = workouts.filter((w) => w.isCompleted);
  const upcomingWorkouts = workouts.filter((w) => !w.isCompleted);

  const activePlan = (clientData.nutritionPlans || []).find((p) => p.isActive) || clientData.nutritionPlan || null;

  const getWorkoutTitle = (workout) => {
    if (workout.name && workout.name.toLowerCase() !== "custom workout") {
      return workout.name;
    }
    if (workout.focusArea) {
      return workout.focusArea;
    }
    return "Workout";
  };

  const getWorkoutSubtitle = (workout) => {
    // Prefer duration if available
    if (workout.duration) {
      return `${workout.duration} min`;
    }

    // Otherwise, use first exercise's sets x reps
    if (workout.exercises && workout.exercises.length > 0) {
      const first = workout.exercises[0];
      const sets = first.sets || 0;
      const reps = first.reps || "";
      return `${sets} x ${reps} ${first.name}`;
    }

    // Fallback to workout type
    return workout.workoutType || "";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Clients
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {clientUser.firstName} {clientUser.lastName}
          </h1>
          <p className="text-gray-400 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {clientUser.email}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Profile Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Profile
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Age</span>
                <span className="text-gray-100">{clientUser.profile?.age || "N/A"} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Weight</span>
                <span className="text-gray-100">{clientUser.profile?.weight || "N/A"} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Height</span>
                <span className="text-gray-100">{clientUser.profile?.height || "N/A"} cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Gender</span>
                <span className="text-gray-100 capitalize">
                  {clientUser.profile?.gender || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fitness Level</span>
                <span className="px-2 py-1 text-xs rounded-full bg-blue-900/30 text-blue-300 capitalize">
                  {clientUser.profile?.fitnessLevel || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Goals & Preferences */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Goals & Preferences
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400 mb-2">Goals</p>
                <div className="flex flex-wrap gap-2">
                  {(clientUser.profile?.goals || []).map((goal) => (
                    <span
                      key={goal}
                      className="px-2 py-1 text-xs rounded-full bg-purple-900/30 text-purple-300 capitalize"
                    >
                      {goal.replace("-", " ")}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Equipment</p>
                <div className="flex flex-wrap gap-2">
                  {(clientUser.profile?.availableEquipment || []).map((eq) => (
                    <span
                      key={eq}
                      className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300 capitalize"
                    >
                      {eq.replace("-", " ")}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Workout Time: </span>
                <span className="text-gray-100 capitalize">
                  {clientUser.preferences?.workoutTime || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition Plan */}
        {activePlan && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5" />
                Active Nutrition Plan
              </h2>
              {/* <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-2 transition-colors">
                <Edit className="w-4 h-4" />
                Edit Plan
              </button> */}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-400">Daily Calories</p>
                <p className="text-lg font-semibold">{activePlan.dailyCalorieTarget}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Protein</p>
                <p className="text-lg font-semibold">
                  {activePlan.macroTargets.protein}g
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Carbs</p>
                <p className="text-lg font-semibold">
                  {activePlan.macroTargets.carbs}g
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Fat</p>
                <p className="text-lg font-semibold">
                  {activePlan.macroTargets.fat}g
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Meals ({(clientData.meals || []).length})</p>
              <div className="flex flex-wrap gap-2">
                {(clientData.meals || []).map((meal) => (
                  <span
                    key={meal._id}
                    className="px-3 py-1 text-sm rounded-lg bg-gray-700 text-gray-300 capitalize"
                  >
                    {meal.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Workouts */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Workouts
            </h2>
            {/* <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-2 transition-colors">
              <Edit className="w-4 h-4" />
              Manage Workouts
            </button> */}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400">Total Workouts</p>
              <p className="text-2xl font-bold">{workouts.length}</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-400">
                {completedWorkouts.length}
              </p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400">Upcoming</p>
              <p className="text-2xl font-bold text-blue-400">
                {upcomingWorkouts.length}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {workouts.slice(0, 5).map((workout) => (
              <div
                key={workout._id}
                className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
              >
                <div>
                  <p className="font-medium">{getWorkoutTitle(workout)}</p>
                  <p className="text-sm text-gray-400">
                    {getWorkoutSubtitle(workout)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      workout.isCompleted
                        ? "bg-green-900/30 text-green-300"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {workout.isCompleted ? "Completed" : "Pending"}
                  </span>
                  {/* <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                  </button> */}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {/* <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-2 transition-colors">
              <Edit className="w-4 h-4" />
              Edit Workout Plan
            </button>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm flex items-center gap-2 transition-colors">
              <MessageSquare className="w-4 h-4" />
              Add Comment
            </button>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-2 transition-colors">
              <Activity className="w-4 h-4" />
              Regenerate Plan
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default CoachDashboard;

