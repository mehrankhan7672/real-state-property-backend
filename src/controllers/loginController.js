const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// Assuming you have a User model
const User = require("../models/User/user"); 

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email ,role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: "1h" } // token expires in 1 hour
  );
};

// Login Controller
exports.storeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token, // send JWT to frontend
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error, please try again later",
    });
  }
};