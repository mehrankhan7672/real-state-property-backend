const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getDashboardStats,
  getAllUsers,
  getPendingProperties,
  updatePropertyApproval,
  getAllProperties,
  updateUserStatus,
  deleteUser,
} = require("../controllers/admin/adminController");

// All admin routes are protected and require admin role
router.use(protect);

// Check if user is admin middleware
const isAdmin = async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin only.",
    });
  }
  next();
};

router.use(isAdmin);

// Dashboard routes
router.get("/dashboard/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.get("/properties/pending", getPendingProperties);
router.get("/properties/all", getAllProperties);

// Update routes
router.put("/property/:propertyId/approve", updatePropertyApproval);
router.put("/user/:userId/status", updateUserStatus);
router.delete("/user/:userId", deleteUser);

module.exports = router;