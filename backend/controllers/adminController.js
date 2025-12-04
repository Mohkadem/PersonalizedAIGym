const User = require('../models/User');
const WorkoutSchedule = require('../models/WorkoutSchedule');
const NutritionPlan = require('../models/NutritionPlan');
const Workout = require('../models/Workout');
const Meal = require('../models/Meal');

class AdminController {
  // Get all users (with pagination)
  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, role, search } = req.query;
      const query = {};

      if (role && role !== 'all') {
        query.role = role;
      }

      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const users = await User.find(query)
        .select('-password')
        .populate('coachProfile.clients', 'firstName lastName email')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(query);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching users',
        error: error.message
      });
    }
  }

  // Get user by ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id)
        .select('-password')
        .populate('coachProfile.clients', 'firstName lastName email profile');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user',
        error: error.message
      });
    }
  }

  // Create a new coach
  async createCoach(req, res) {
    try {
      const { email, password, firstName, lastName, specialization, experience, bio } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      const coach = new User({
        email,
        password,
        firstName,
        lastName,
        role: 'coach',
        coachProfile: {
          specialization: specialization || [],
          experience: experience || 0,
          bio: bio || '',
          clients: []
        }
      });

      await coach.save();

      res.status(201).json({
        success: true,
        message: 'Coach created successfully',
        data: {
          id: coach._id,
          email: coach.email,
          firstName: coach.firstName,
          lastName: coach.lastName,
          role: coach.role,
          coachProfile: coach.coachProfile
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating coach',
        error: error.message
      });
    }
  }

  // Create a new admin
  async createAdmin(req, res) {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      const admin = new User({
        email,
        password,
        firstName,
        lastName,
        role: 'admin'
      });

      await admin.save();

      res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        data: {
          id: admin._id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating admin',
        error: error.message
      });
    }
  }

  // Assign coach to client
  async assignCoachToClient(req, res) {
    try {
      const { clientId, coachId } = req.body;

      // Handle both email addresses and user IDs
      let client, coach;
      
      // Check if clientId is an email or user ID
      if (clientId.includes('@')) {
        client = await User.findOne({ email: clientId });
      } else {
        client = await User.findById(clientId);
      }
      
      // Check if coachId is an email or user ID
      if (coachId.includes('@')) {
        coach = await User.findOne({ email: coachId });
      } else {
        coach = await User.findById(coachId);
      }

      if (!client || !coach) {
        return res.status(404).json({
          success: false,
          message: 'Client or coach not found'
        });
      }

      if (coach.role !== 'coach') {
        return res.status(400).json({
          success: false,
          message: 'User is not a coach'
        });
      }

      // Add client to coach's client list
      if (!coach.coachProfile.clients.includes(client._id)) {
        coach.coachProfile.clients.push(client._id);
        await coach.save();
      }

      res.json({
        success: true,
        message: 'Coach assigned to client successfully',
        data: {
          client: {
            id: client._id,
            name: `${client.firstName} ${client.lastName}`,
            email: client.email
          },
          coach: {
            id: coach._id,
            name: `${coach.firstName} ${coach.lastName}`,
            email: coach.email
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error assigning coach to client',
        error: error.message
      });
    }
  }

  // Remove coach from client
  async removeCoachFromClient(req, res) {
    try {
      const { clientId, coachId } = req.body;

      const coach = await User.findById(coachId);
      if (!coach) {
        return res.status(404).json({
          success: false,
          message: 'Coach not found'
        });
      }

      // Remove client from coach's client list
      coach.coachProfile.clients = coach.coachProfile.clients.filter(
        id => id.toString() !== clientId
      );
      await coach.save();

      res.json({
        success: true,
        message: 'Coach removed from client successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error removing coach from client',
        error: error.message
      });
    }
  }

  // Delete user
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Handle both email and ObjectId
      let user;
      if (id.includes('@')) {
        // If it's an email address
        user = await User.findOne({ email: id });
      } else {
        // If it's an ObjectId
        user = await User.findById(id);
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Don't allow deleting the current admin
      if (req.user.id === user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }

      // If deleting a coach, remove them from all clients
      if (user.role === 'coach') {
        await User.updateMany(
          { 'coachProfile.clients': user._id },
          { $pull: { 'coachProfile.clients': user._id } }
        );
      }

      // Delete related data
      await WorkoutSchedule.deleteMany({ userId: user._id });
      await NutritionPlan.deleteMany({ userId: user._id });
      await Workout.deleteMany({ userId: user._id });
      await Meal.deleteMany({ userId: user._id });

      // Delete the user
      await User.findByIdAndDelete(user._id);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting user',
        error: error.message
      });
    }
  }

  // Update user profile/details (admin)
  async updateUserProfile(req, res) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Do not allow these fields to be changed here
      delete updateData.password;
      delete updateData.role;
      delete updateData.isActive;

      const user = await User.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error updating user',
        error: error.message
      });
    }
  }


  // Update user status (activate/deactivate)
  async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const user = await User.findByIdAndUpdate(
        id,
        { isActive },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating user status',
        error: error.message
      });
    }
  }

  // Get dashboard stats
  async getDashboardStats(req, res) {
    try {
      const totalUsers = await User.countDocuments({ role: 'user' });
      const totalCoaches = await User.countDocuments({ role: 'coach' });
      const totalAdmins = await User.countDocuments({ role: 'admin' });
      const activeUsers = await User.countDocuments({ role: 'user', isActive: true });
      const activeCoaches = await User.countDocuments({ role: 'coach', isActive: true });

      // Recent registrations (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentUsers = await User.countDocuments({
        role: 'user',
        createdAt: { $gte: sevenDaysAgo }
      });

      res.json({
        success: true,
        data: {
          totalUsers,
          totalCoaches,
          totalAdmins,
          activeUsers,
          activeCoaches,
          recentUsers
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard stats',
        error: error.message
      });
    }
  }
}

module.exports = new AdminController();
