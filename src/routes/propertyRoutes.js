const express = require("express");
const router = express.Router();
const { createProperty ,getPropertyById,getUserProperties, updateProperty, deleteProperty, getApprovedProperties} = require("../controllers/agent/propertyController");

// upload middleware
const multer = require("multer");

// simple storage (local)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });


// ✅ ROUTE
router.post(
  "/add-property",
  upload.array("images", 5), // max 5 images
  createProperty
);
// GET single property
router.get("/property", getUserProperties);
router.get("/property/:id", getPropertyById);

// UPDATE property
router.put("/property/:id", updateProperty);

// DELETE property
router.delete("/property/:id", deleteProperty);
router.get("/properties", getApprovedProperties);

module.exports = router;