const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const router = require("./src/routes/index");
const propertyRoutes = require("./src/routes/propertyRoutes")
const {getAllProperties}  = require("./src/controllers/agent/getProperties");
const customerProperties = require("./src/routes/index");
const inquiryRoutes = require("./src/routes/inquiryRoutes");
const {getAgentInquiries} = require("./src/controllers/agent/inquiriesController")
const replyRoutes = require('./src/routes/replyRoutes')
const adminRoutes = require("./src/routes/adminRoutes");
const path = require("path");
const cors = require("cors"); 
const app = express();
dotenv.config();
connectDB();
const cors = require("cors");

// MUST be first
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://real-state-property-seven.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// handle preflight properly
app.options("*", cors());
//routes
app.use("/",router)
//auth routes
app.use('/api',router)
app.use('/api',router)
//get all users
app.use('/users',protect,router)
//get file
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//store agent properties details 
app.use("/property",protect,propertyRoutes);
//get all properties
app.get("/get-all-properties",protect, getAllProperties);
//get all properties for customer
app.use("/",protect,customerProperties);
//inquiry routes 
app.use('/api',protect, inquiryRoutes);
//list inquiries for agent 
app.use('/get-agent-inquiries',protect,getAgentInquiries)
//reply of inquiries
app.use('/replies',protect,replyRoutes)
//get data for admin dashboard
app.use("/api/admin", adminRoutes);
//----------------------------------------------------------------------------------------------//
//running server
const PORT = process.env.PORT
app.listen(process.env.PORT,()=>{console.log(`Server running on port ${PORT}`)})

module.exports = app