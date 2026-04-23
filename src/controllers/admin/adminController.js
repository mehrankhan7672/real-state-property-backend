const User = require("../../models/User/user");
const Property = require("../../models/agent/Property");
const Inquiry = require("../../models/User/Inquiry");
const Reply = require("../../models/agent/Reply");

// Get admin dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    // Get user counts
    const totalUsers = await User.countDocuments();
    const totalAgents = await User.countDocuments({ role: "agent" });
    const totalCustomers = await User.countDocuments({ role: "customer" });
    
    // Get property counts
    const totalProperties = await Property.countDocuments();
    const pendingApprovals = await Property.countDocuments({ approve: "pending" });
    const activeListings = await Property.countDocuments({ status: "available", approve: "approve" });
    const soldProperties = await Property.countDocuments({ status: "sold" });
    
    // Calculate total revenue from sold properties
    const soldPropertiesData = await Property.find({ status: "sold" });
    const totalRevenue = soldPropertiesData.reduce((sum, prop) => sum + (prop.price || 0), 0);
    
    // Get recent activities
    const recentProperties = await Property.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name");
    
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    const recentInquiries = await Inquiry.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name")
      .populate("propertyId", "title");
    
    // Combine activities
    const recentActivities = [
      ...recentProperties.map(p => ({
        id: p._id,
        action: "New property listed",
        user: p.user?.name || "Unknown",
        time: p.createdAt,
        type: "property",
        details: p.title
      })),
      ...recentUsers.map(u => ({
        id: u._id,
        action: "New user registered",
        user: u.name,
        time: u.createdAt,
        type: "user",
        details: u.email
      })),
      ...recentInquiries.map(i => ({
        id: i._id,
        action: "Customer inquiry",
        user: i.userId?.name || "Unknown",
        time: i.createdAt,
        type: "inquiry",
        details: i.message
      }))
    ];
    
    // Sort by time and get latest 10
    recentActivities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const latestActivities = recentActivities.slice(0, 10);
    
    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalAgents,
          totalCustomers,
          totalProperties,
          pendingApprovals,
          activeListings,
          soldProperties,
          totalRevenue: totalRevenue.toLocaleString(),
        },
        recentActivities: latestActivities.map(activity => ({
          ...activity,
          time: getTimeAgo(activity.time)
        })),
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};

// Get all users (agents and customers)
const getAllUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    
    let query = {};
    
    if (role && role !== "all") {
      query.role = role;
    }
    
    if (status && status !== "all") {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    
    const users = await User.find(query).sort({ createdAt: -1 });
    
    // Get property counts for agents
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const propertyCount = await Property.countDocuments({ user: user._id });
        const soldCount = await Property.countDocuments({ user: user._id, status: "sold" });
        
        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status || "active",
          joinDate: user.createdAt,
          properties: propertyCount,
          sales: soldCount,
          avatar: user.name?.charAt(0) || "U",
          phone: user.phone || "",
          address: user.address || "",
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: usersWithStats.length,
      data: usersWithStats,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// Get pending properties for approval
const getPendingProperties = async (req, res) => {
  try {
    const properties = await Property.find({ approve: "pending" })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    
    const formattedProperties = properties.map(property => ({
      id: property._id,
      title: property.title,
      location: property.location,
      price: property.price,
      agent: property.user?.name || "Unknown",
      agentId: property.user?._id,
      submittedDate: property.createdAt,
      status: property.approve,
      imageUrl: property.images && property.images.length > 0 
        ? `${req.protocol}://${req.get("host")}/${property.images[0].replace(/\\/g, "/")}`
        : "https://via.placeholder.com/800x500?text=No+Image",
      description: property.description,
      beds: property.beds,
      baths: property.baths,
      sqft: property.sqft,
      propertyType: property.propertyType,
    }));
    
    res.status(200).json({
      success: true,
      count: formattedProperties.length,
      data: formattedProperties,
    });
  } catch (error) {
    console.error("Error fetching pending properties:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending properties",
      error: error.message,
    });
  }
};

// Approve or reject property
const updatePropertyApproval = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { action, notes } = req.body; // action: "approve" or "reject"
    
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'approve' or 'reject'",
      });
    }
    
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }
    
    property.approve = action === "approve" ? "approve" : "rejected";
    if (notes) {
      property.adminNotes = notes;
    }
    
    await property.save();
    
    res.status(200).json({
      success: true,
      message: `Property ${action}d successfully`,
      data: property,
    });
  } catch (error) {
    console.error("Error updating property approval:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update property approval",
      error: error.message,
    });
  }
};

// Get all properties (with filters)
const getAllProperties = async (req, res) => {
  try {
    const { status, approve, search } = req.query;
    
    let query = {};
    
    if (status && status !== "all") {
      query.status = status;
    }
    
    if (approve && approve !== "all") {
      query.approve = approve;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }
    
    const properties = await Property.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    
    const formattedProperties = properties.map(property => ({
      id: property._id,
      title: property.title,
      location: property.location,
      price: property.price,
      agent: property.user?.name || "Unknown",
      agentId: property.user?._id,
      status: property.status,
      approve: property.approve,
      submittedDate: property.createdAt,
      imageUrl: property.images && property.images.length > 0 
        ? `${req.protocol}://${req.get("host")}/${property.images[0].replace(/\\/g, "/")}`
        : "https://via.placeholder.com/800x500?text=No+Image",
      description: property.description,
      beds: property.beds,
      baths: property.baths,
      sqft: property.sqft,
      propertyType: property.propertyType,
      badge: property.badge,
    }));
    
    res.status(200).json({
      success: true,
      count: formattedProperties.length,
      data: formattedProperties,
    });
  } catch (error) {
    console.error("Error fetching all properties:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch properties",
      error: error.message,
    });
  }
};

// Update user status (active/inactive)
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'active' or 'inactive'",
      });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { status: status },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: {
        id: user._id,
        name: user.name,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error: error.message,
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    // Also delete user's properties if they are an agent
    if (user.role === "agent") {
      await Property.deleteMany({ user: userId });
    }
    
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

// Helper function to get time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? "" : "s"} ago`;
    }
  }
  return "Just now";
}

module.exports = {
  getDashboardStats,
  getAllUsers,
  getPendingProperties,
  updatePropertyApproval,
  getAllProperties,
  updateUserStatus,
  deleteUser,
};