import React, { useState, useEffect } from "react";
import {
  Users,
  Mail,
  Edit,
  X,
  Save,
  UserPlus,
  UserMinus,
  Shield,
  UserCheck,
  ChevronLeft,
  Target,
} from "lucide-react";
import { adminAPI, authAPI, getAuthToken } from "../../services/api";

const AdminDashboard = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [adminUser, setAdminUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectedCoachId, setSelectedCoachId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const token = getAuthToken();
      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      try {
        // Load admin user profile
        const profileResponse = await authAPI.getProfile(token);
        if (profileResponse.success && profileResponse.data?.user) {
          setAdminUser(profileResponse.data.user);
        }

        // Load all users
        const usersResponse = await adminAPI.getAllUsers(token, { limit: 1000 });
        if (usersResponse.success && usersResponse.data) {
          const usersData = usersResponse.data.users || usersResponse.data || [];
          setAllUsers(usersData);
        } else {
          setError(usersResponse.message || "Failed to load users");
        }
      } catch (err) {
        setError("An error occurred while loading data");
        console.error("Admin dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Separate clients and coaches
  const clients = allUsers.filter((u) => u.role === "user");
  const coaches = allUsers.filter((u) => u.role === "coach");

  const handleEditClick = (user) => {
    setEditingUser(user);

    const userIdStr = (user._id || user.id || "").toString();

    // coaches is derived from allUsers: const coaches = allUsers.filter(u => u.role === "coach");
    const currentCoach = coaches.find((coach) =>
      (coach.coachProfile?.clients || []).some((client) => {
        const clientId =
          (client && (client._id || client.id)) || client; // populated doc or raw id
        return clientId && clientId.toString() === userIdStr;
      })
    );

    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isActive: user.isActive,
      age: user.profile?.age || "",
      weight: user.profile?.weight || "",
      height: user.profile?.height || "",
      gender: user.profile?.gender || "",
      fitnessLevel: user.profile?.fitnessLevel || "",
      goals: user.profile?.goals || [],
      availableEquipment: user.profile?.availableEquipment || [],
      workoutTime: user.preferences?.workoutTime || "",
      speciality: user.coachProfile?.specialization?.join(", ") || "",
    });

    setSelectedCoachId(currentCoach?._id || currentCoach?.id || "");
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    const token = getAuthToken();
    if (!token) {
      setError("Not authenticated");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const userId = editingUser._id || editingUser.id;

      // Build profile update
      const profileUpdate = {};
      if (editForm.age !== "") profileUpdate.age = Number(editForm.age);
      if (editForm.weight !== "") profileUpdate.weight = Number(editForm.weight);
      if (editForm.height !== "") profileUpdate.height = Number(editForm.height);

      if (editingUser.role === "user") {
        if (editForm.gender) profileUpdate.gender = editForm.gender;
        if (editForm.fitnessLevel)
          profileUpdate.fitnessLevel = editForm.fitnessLevel;
        profileUpdate.goals = editForm.goals || [];
        profileUpdate.availableEquipment = editForm.availableEquipment || [];
      }

      const updateData = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
      };

      if (Object.keys(profileUpdate).length > 0) {
        updateData.profile = profileUpdate;
      }

      if (editingUser.role === "user") {
        updateData.preferences = {
          workoutTime: editForm.workoutTime || "",
        };
      } else if (editingUser.role === "coach") {
        const specializationArray = (editForm.speciality || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        updateData.coachProfile = {
          specialization: specializationArray,
          gender: editForm.gender,
        };
      }

      // 1) Update profile/details
      await adminAPI.updateUserProfile(token, userId, updateData);

      // 2) Update user status if changed
      if (editingUser.isActive !== editForm.isActive) {
        await adminAPI.updateUserStatus(token, userId, editForm.isActive);
      }

      // 3) Handle coach assignment if it's a client
      if (editingUser.role === "user") {
        const clientId = userId;
        const clientIdStr = (clientId || "").toString();

        const currentCoach = coaches.find((coach) =>
          (coach.coachProfile?.clients || []).some((client) => {
            const cid =
              (client && (client._id || client.id)) || client; // populated doc or raw id
            return cid && cid.toString() === clientIdStr;
          })
        );

        if (selectedCoachId && currentCoach?._id !== selectedCoachId) {
          // Remove from old coach if exists
          if (currentCoach) {
            await adminAPI.removeCoachFromClient(
              token,
              clientId,
              currentCoach._id || currentCoach.id
            );
          }
          // Assign to new coach
          await adminAPI.assignCoachToClient(token, clientId, selectedCoachId);
        } else if (!selectedCoachId && currentCoach) {
          // Remove coach assignment
          await adminAPI.removeCoachFromClient(
            token,
            clientId,
            currentCoach._id || currentCoach.id
          );
        }
      }

      // 4) Reload users to get updated data
      const usersResponse = await adminAPI.getAllUsers(token, { limit: 1000 });
      if (usersResponse.success && usersResponse.data) {
        const usersData = usersResponse.data.users || usersResponse.data || [];
        setAllUsers(usersData);
      }

      setEditingUser(null);
      setEditForm({});
      setSelectedCoachId("");
    } catch (err) {
      setError("An error occurred while saving changes");
      console.error("Save edit error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({});
    setSelectedCoachId("");
  };

  const handleRemoveCoach = async (clientId) => {
    const token = getAuthToken();
    if (!token) {
      setError("Not authenticated");
      return;
    }

    try {
      // Find which coach has this client
      const coachWithClient = coaches.find(
        (coach) => coach.coachProfile?.clients?.includes(clientId)
      );

      if (coachWithClient) {
        await adminAPI.removeCoachFromClient(
          token,
          clientId,
          coachWithClient._id || coachWithClient.id
        );

        // Reload users
        const usersResponse = await adminAPI.getAllUsers(token, { limit: 1000 });
        if (usersResponse.success && usersResponse.data) {
          const usersData = usersResponse.data.users || usersResponse.data || [];
          setAllUsers(usersData);
        }
      }

      // Update selectedCoachId if we're in edit mode
      if (editingUser && (editingUser._id === clientId || editingUser.id === clientId)) {
        setSelectedCoachId("");
      }
    } catch (err) {
      setError("An error occurred while removing coach");
      console.error("Remove coach error:", err);
    }
  };

  const getClientCoach = (clientId) => {
    const clientIdStr = (clientId || "").toString();

    return coaches.find((coach) =>
      (coach.coachProfile?.clients || []).some((client) => {
        const cid =
          (client && (client._id || client.id)) ||
          client; // populated doc or raw id
        return cid && cid.toString() === clientIdStr;
      })
    );
  };

  // Show detail edit view if editing a user
  if (editingUser) {
    return (
      <UserDetailEditView
        user={editingUser}
        editForm={editForm}
        setEditForm={setEditForm}
        selectedCoachId={selectedCoachId}
        setSelectedCoachId={setSelectedCoachId}
        coaches={coaches}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
        onRemoveCoach={handleRemoveCoach}
        getClientCoach={getClientCoach}
        saving={saving}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 px-3 py-2 bg-red-900/30 text-red-300 rounded text-sm border border-red-800">
            {error}
          </div>
        )}
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Admin Dashboard
          </h1>
          <p className="text-gray-400">
            {adminUser 
              ? `Welcome back, ${adminUser.firstName} ${adminUser.lastName}. Manage users, coaches, and assignments.`
              : "Manage users, coaches, and assignments"}
          </p>
        </div>

        {/* Clients Table */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Clients ({clients.length})
            </h2>
          </div>

          {clients.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No clients found.
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
                      Profile Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Assigned Coach
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {clients.map((client) => {
                    const assignedCoach = getClientCoach(client._id);

                    return (
                      <tr
                        key={client._id}
                        className="hover:bg-gray-750 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-100">
                              {client.firstName} {client.lastName}
                            </div>
                            <div className="text-sm text-gray-400 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {client.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm space-y-1">
                            <div className="text-gray-300">
                              Age: {client.profile?.age || "N/A"} | Weight:{" "}
                              {client.profile?.weight || "N/A"} kg | Height:{" "}
                              {client.profile?.height || "N/A"} cm
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 capitalize">
                                {client.profile?.gender || "N/A"}
                              </span>
                              {client.profile?.fitnessLevel && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-900/30 text-blue-300 capitalize">
                                  {client.profile.fitnessLevel}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {assignedCoach ? (
                            <span className="text-sm text-gray-300">
                              {assignedCoach.firstName} {assignedCoach.lastName}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">
                              No coach assigned
                            </span>
                          )}
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleEditClick(client)}
                            disabled={saving}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded text-xs flex items-center gap-1 transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Coaches Table */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Coaches ({coaches.length})
            </h2>
          </div>

          {coaches.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No coaches found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-750 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Coach
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Profile Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Specialization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Clients Assigned
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {coaches.map((coach) => {
                    const assignedClients = coach.coachProfile?.clients || [];
                    const clientNames = assignedClients
                      .map((clientId) => {
                        const client = clients.find((c) => c._id === clientId);
                        return client
                          ? `${client.firstName} ${client.lastName}`
                          : null;
                      })
                      .filter(Boolean);

                    return (
                      <tr
                        key={coach._id}
                        className="hover:bg-gray-750 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-100">
                              {coach.firstName} {coach.lastName}
                            </div>
                            <div className="text-sm text-gray-400 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {coach.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm space-y-1">
                            <div className="text-gray-300">
                              Age: {coach.profile?.age || "N/A"} | Weight:{" "}
                              {coach.profile?.weight || "N/A"} kg | Height:{" "}
                              {coach.profile?.height || "N/A"} cm
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 capitalize">
                                {coach.profile?.gender || "N/A"}
                              </span>
                              {coach.profile?.fitnessLevel && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-900/30 text-blue-300 capitalize">
                                  {coach.profile.fitnessLevel}
                                </span>
                              )}
                            </div>
                            {coach.coachProfile?.experience && (
                              <div className="text-gray-400">
                                Experience: {coach.coachProfile.experience} years
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {coach.coachProfile?.specialization ? (
                            <div className="flex flex-wrap gap-1">
                              {coach.coachProfile.specialization
                                .slice(0, 3)
                                .map((spec) => (
                                  <span
                                    key={spec}
                                    className="px-2 py-1 text-xs rounded-full bg-purple-900/30 text-purple-300 capitalize"
                                  >
                                    {spec.replace("-", " ")}
                                  </span>
                                ))}
                              {coach.coachProfile.specialization.length > 3 && (
                                <span className="px-2 py-1 text-xs text-gray-400">
                                  +{coach.coachProfile.specialization.length - 3}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-gray-300 mb-1">
                              {assignedClients.length} client
                              {assignedClients.length !== 1 ? "s" : ""}
                            </div>
                            {clientNames.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {clientNames.slice(0, 2).map((name, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300"
                                  >
                                    {name}
                                  </span>
                                ))}
                                {clientNames.length > 2 && (
                                  <span className="px-2 py-1 text-xs text-gray-400">
                                    +{clientNames.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              coach.isActive
                                ? "bg-green-900/30 text-green-300"
                                : "bg-gray-700 text-gray-400"
                            }`}
                          >
                            {coach.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleEditClick(coach)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs flex items-center gap-1 transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
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

const UserDetailEditView = ({
  user,
  editForm,
  setEditForm,
  selectedCoachId,
  setSelectedCoachId,
  coaches,
  onSave,
  onCancel,
  onRemoveCoach,
  getClientCoach,
  saving,
}) => {
  const assignedCoach = user.role === "user" ? getClientCoach(user._id) : null;
  const availableGoals = [
    "lose-weight",
    "build-muscle",
    "general-fitness",
    "improve-endurance",
    "flexibility",
  ];
  const availableEquipment = [
    "bodyweight",
    "dumbbells",
    "barbell",
    "full-gym-access",
    "resistance-bands",
  ];

  const toggleGoal = (goal) => {
    const currentGoals = editForm.goals || [];
    if (currentGoals.includes(goal)) {
      setEditForm({
        ...editForm,
        goals: currentGoals.filter((g) => g !== goal),
      });
    } else {
      setEditForm({
        ...editForm,
        goals: [...currentGoals, goal],
      });
    }
  };

  const toggleEquipment = (equipment) => {
    const currentEquipment = editForm.availableEquipment || [];
    if (currentEquipment.includes(equipment)) {
      setEditForm({
        ...editForm,
        availableEquipment: currentEquipment.filter((e) => e !== equipment),
      });
    } else {
      setEditForm({
        ...editForm,
        availableEquipment: [...currentEquipment, equipment],
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onCancel}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to {user.role === "user" ? "Clients" : "Coaches"}
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Edit {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-400 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {user.email}
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
              <div className="flex justify-between items-center">
                <span className="text-gray-400">First Name</span>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, firstName: e.target.value })
                  }
                  className="w-48 px-3 py-1 bg-gray-700 text-gray-100 rounded border border-gray-600"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Last Name</span>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, lastName: e.target.value })
                  }
                  className="w-48 px-3 py-1 bg-gray-700 text-gray-100 rounded border border-gray-600"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Email</span>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-48 px-3 py-1 bg-gray-700 text-gray-100 rounded border border-gray-600"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Age</span>
                <input
                  type="number"
                  value={editForm.age}
                  onChange={(e) =>
                    setEditForm({ ...editForm, age: e.target.value })
                  }
                  className="w-48 px-3 py-1 bg-gray-700 text-gray-100 rounded border border-gray-600"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Weight (kg)</span>
                <input
                  type="number"
                  value={editForm.weight}
                  onChange={(e) =>
                    setEditForm({ ...editForm, weight: e.target.value })
                  }
                  className="w-48 px-3 py-1 bg-gray-700 text-gray-100 rounded border border-gray-600"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Height (cm)</span>
                <input
                  type="number"
                  value={editForm.height}
                  onChange={(e) =>
                    setEditForm({ ...editForm, height: e.target.value })
                  }
                  className="w-48 px-3 py-1 bg-gray-700 text-gray-100 rounded border border-gray-600"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Gender</span>
                <select
                  value={editForm.gender}
                  onChange={(e) =>
                    setEditForm({ ...editForm, gender: e.target.value })
                  }
                  className="w-48 px-2 py-1 bg-gray-700 text-gray-100 rounded border border-gray-600"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              {user.role === "user" && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Fitness Level</span>
                    <select
                      value={editForm.fitnessLevel}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          fitnessLevel: e.target.value,
                        })
                      }
                      className="w-48 px-2 py-1 bg-gray-700 text-gray-100 rounded border border-gray-600"
                    >
                      <option value="">Select Fitness Level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </>
              )}

              {user.role === "coach" && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Speciality</span>
                  <input
                    type="text"
                    value={editForm.speciality}
                    onChange={(e) =>
                      setEditForm({ ...editForm, speciality: e.target.value })
                    }
                    className="w-48 px-3 py-1 bg-gray-700 text-gray-100 rounded border border-gray-600"
                    placeholder="e.g. strength, endurance"
                  />
                </div>
              )}
              {/* <div className="flex justify-between items-center">
                <span className="text-gray-400">Gender</span>
                <select
                  value={editForm.gender}
                  onChange={(e) =>
                    setEditForm({ ...editForm, gender: e.target.value })
                  }
                  className="w-48 px-3 py-1 bg-gray-700 text-gray-100 rounded border border-gray-600"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Fitness Level</span>
                <select
                  value={editForm.fitnessLevel}
                  onChange={(e) =>
                    setEditForm({ ...editForm, fitnessLevel: e.target.value })
                  }
                  className="w-48 px-3 py-1 bg-gray-700 text-gray-100 rounded border border-gray-600"
                >
                  <option value="">Select Fitness Level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div> */}
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Status</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) =>
                      setEditForm({ ...editForm, isActive: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-gray-100">Active</span>
                </label>
              </div>
            </div>
          </div>

          {/* Goals & Preferences */}
          {user.role === "user" && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Goals & Preferences
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Goals</p>
                  <div className="flex flex-wrap gap-2">
                    {availableGoals.map((goal) => (
                      <button
                        key={goal}
                        onClick={() => toggleGoal(goal)}
                        className={`px-2 py-1 text-xs rounded-full capitalize transition-colors ${
                          editForm.goals?.includes(goal)
                            ? "bg-purple-900/30 text-purple-300 border border-purple-500"
                            : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                        }`}
                      >
                        {goal.replace("-", " ")}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Equipment</p>
                  <div className="flex flex-wrap gap-2">
                    {availableEquipment.map((eq) => (
                      <button
                        key={eq}
                        onClick={() => toggleEquipment(eq)}
                        className={`px-2 py-1 text-xs rounded-full capitalize transition-colors ${
                          editForm.availableEquipment?.includes(eq)
                            ? "bg-gray-600 text-gray-200 border border-gray-500"
                            : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                        }`}
                      >
                        {eq.replace("-", " ")}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">Workout Time: </span>
                  <select
                    value={editForm.workoutTime}
                    onChange={(e) =>
                      setEditForm({ ...editForm, workoutTime: e.target.value })
                    }
                    className="ml-2 px-2 py-1 bg-gray-700 text-gray-100 rounded border border-gray-600"
                  >
                    <option value="">Select Time</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Coach Assignment (for clients only) */}
          {user.role === "user" && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 md:col-span-2">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Coach Assignment
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-2">
                    Assign Coach
                  </label>
                  <select
                    value={selectedCoachId}
                    onChange={(e) => setSelectedCoachId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 text-gray-100 rounded border border-gray-600"
                  >
                    <option value="">No Coach Assigned</option>
                    {coaches.map((coach) => (
                      <option key={coach._id} value={coach._id}>
                        {coach.firstName} {coach.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                {assignedCoach && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">
                      Currently: {assignedCoach.firstName}{" "}
                      {assignedCoach.lastName}
                    </span>
                    <button
                      onClick={() => {
                        onRemoveCoach(user._id);
                        setSelectedCoachId("");
                      }}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm flex items-center gap-2 transition-colors"
                    >
                      <UserMinus className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onSave}
              disabled={saving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={onCancel}
              disabled={saving}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

