// controllers/userController.js
const User = require("../../models/User/user");

// Get All Users (only customers and agents) with role counts
exports.getAllUsers = async (req, res) => {
  try {
    // 1️⃣ Fetch users with role 'customer' or 'agent'
    const users = await User.find({ role: { $in: ["customer", "agent"] } }).select("-password");

    // 2️⃣ Count users by role (only customer and agent)
    const counts = await User.aggregate([
      { $match: { role: { $in: ["customer", "agent"] } } }, // exclude admin
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert counts to an easy object: { customer: 5, agent: 2 }
    const roleCounts = {};
    counts.forEach((item) => {
      roleCounts[item._id] = item.count;
    });

    // 3️⃣ Send response
    res.status(200).json({
      success: true,
      totalUsers: users.length,
      roleCounts,
      users,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "can't get users",
    });
  }
};