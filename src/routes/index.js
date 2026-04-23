const express = require("express");
const {getHome} = require("../controllers/homeController");
const { storeLogin } = require("../controllers/loginController");
const { storeRegister } = require("../controllers/registerController");
const { protect } = require("../middleware/authMiddleware");
const getUser = require("../controllers/userController/getUser")
const { getApprovedProperties } = require("../controllers/agent/propertyController");
const router = express.Router();

router.get('/',getHome)
//login route
router.post('/login',storeLogin)
//register route
router.post('/register',storeRegister)
// GET all users
router.get("/users", protect,getUser.getAllUsers);
//get approve properties for customer
router.get("/properties", getApprovedProperties);
module.exports = router