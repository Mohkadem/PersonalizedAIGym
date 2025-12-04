const User = require('../models/User');
const { generateTokens } = require('../utils/jwt');
const bcrypt = require('bcryptjs');

// Register new user
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Determine valid role
    const allowedRoles = ['user', 'coach', 'admin'];
    const selectedRole = allowedRoles.includes(role) ? role : 'user';

    // Create user without profile (will be completed during onboarding)
    const userData = {
      email,
      password,
      firstName,
      lastName,
      role: selectedRole,
      isActive: true
    };

    // Create user (password will be hashed by the pre-save hook)
    const user = await User.create(userData);

    // Generate tokens
    const tokens = generateTokens(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive
        },
        tokens
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      
      // Create user-friendly error message
      let userMessage = 'Please check your input: ';
      if (errors.some(err => err.includes('shorter than the minimum allowed length'))) {
        userMessage = 'Password must be at least 6 characters long.';
      } else if (errors.some(err => err.includes('Email already exists'))) {
        userMessage = 'This email is already registered.';
      } else {
        userMessage = errors.join(', ');
      }
      
      return res.status(400).json({
        success: false,
        message: userMessage,
        errors: errors
      });
    }
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const tokens = generateTokens(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          profile: user.profile,
          preferences: user.preferences
        },
        tokens
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          profile: user.profile,
          preferences: user.preferences,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    // Remove sensitive fields
    delete updateData.password;
    delete updateData.role;
    delete updateData.isActive;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          profile: user.profile,
          preferences: user.preferences,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Login with role
const loginWithRole = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check if user role matches requested role
    if (user.role !== role) {
      return res.status(401).json({
        success: false,
        message: `Invalid role. Expected ${role}`
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const tokens = generateTokens(user);

    res.status(200).json({
      success: true,
      message: `${role} login successful`,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          profile: user.profile,
          preferences: user.preferences,
          coachProfile: user.coachProfile
        },
        tokens
      }
    });
  } catch (error) {
    console.error('Role login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Logout (client-side token removal)
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Public: get active coaches for the marketing / home page
const getPublicCoaches = async (req, res) => {
  try {
    const coaches = await User.find({ role: 'coach', isActive: true })
      .select('firstName lastName coachProfile');

    const data = coaches.map((coach) => ({
      id: coach._id,
      Trainer_Name: `${coach.firstName} ${coach.lastName}`,
      speciality: coach.coachProfile &&
        Array.isArray(coach.coachProfile.specialization) &&
        coach.coachProfile.specialization.length > 0
        ? coach.coachProfile.specialization.join(', ')
        : 'Personal Training',
    }));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching public coaches:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coaches',
      error: error.message,
    });
  }
};


module.exports = {
  register,
  login,
  loginWithRole,
  getProfile,
  updateProfile,
  logout,
  getPublicCoaches,
};
