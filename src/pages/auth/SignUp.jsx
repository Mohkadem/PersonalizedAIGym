import signupImg from "/signupImage.png";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { authAPI, setAuthToken } from "../../services/api";
import { UserPlus } from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatedPassword, setRepeatedPassword] = useState("");
  const [accountType, setAccountType] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== repeatedPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        email: email.toLowerCase(),
        password,
        firstName,
        lastName,
        role: accountType,
      });

      if (!response.success) {
        setError(response.message || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      const { user, tokens } = response.data;

      // Store tokens and user info
      setAuthToken(tokens.accessToken);
      localStorage.setItem("userId", user._id || user.id);
      localStorage.setItem("userRole", user.role || "user");
      localStorage.setItem("username", `${user.firstName} ${user.lastName}`);
      localStorage.setItem("refreshToken", tokens.refreshToken);

      // Navigate based on role
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "coach") {
        navigate("/coach/questionary");
      } else {
        navigate("/member/questionary");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <UserPlus className="w-8 h-8" />
            Sign Up
          </h1>
          <p className="text-gray-400">Create your account to get started</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <form className="flex flex-col gap-4" onSubmit={handleSignUp}>
              <div className="flex flex-col">
                <label htmlFor="firstName" className="text-sm text-gray-400 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  className="px-4 py-2 bg-gray-700 text-gray-100 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="lastName" className="text-sm text-gray-400 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  className="px-4 py-2 bg-gray-700 text-gray-100 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label htmlFor="email" className="text-sm text-gray-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="px-4 py-2 bg-gray-700 text-gray-100 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Password */}
              <div className="flex flex-col">
                <label htmlFor="password" className="text-sm text-gray-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="px-4 py-2 bg-gray-700 text-gray-100 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col">
                <label htmlFor="confirmPassword" className="text-sm text-gray-400 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={repeatedPassword}
                  onChange={(e) => setRepeatedPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="px-4 py-2 bg-gray-700 text-gray-100 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Account Type */}
              <div className="flex flex-col">
                <label htmlFor="accountType" className="text-sm text-gray-400 mb-1">
                  Account Type
                </label>
                <select
                  id="accountType"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  required
                >
                  <option value="user">User</option>
                  <option value="coach">Coach</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {error && (
                <div className="px-3 py-2 bg-red-900/30 text-red-300 rounded text-sm border border-red-800">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                {loading ? "Creating account..." : "Sign Up"}
              </button>

              {/* Login Link */}
              <p className="text-center text-sm mt-2 text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-400 font-medium hover:text-blue-300 hover:underline"
                >
                  Login
                </Link>
              </p>
            </form>
          </div>

          <div className="hidden lg:flex justify-center">
            <img src={signupImg} alt="Sign up" className="w-full max-w-md rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
