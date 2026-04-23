const Property = require("../../models/agent/Property");

// ✅ CREATE PROPERTY
exports.createProperty = async (req, res) => {
  try {
    const title = req.body?.title;
    const location = req.body?.location;
    const price = req.body?.price;
    const beds = req.body?.beds;
    const baths = req.body?.baths;
    const sqft = req.body?.sqft;
    const propertyType = req.body?.propertyType;
    const description = req.body?.description;
    const badge = req.body?.badge;
    const status = req.body?.status;

    // ✅ Validate required fields
    if (!title || !location || !price) {
      return res.status(400).json({
        success: false,
        message: "Title, location and price are required",
      });
    }

    // ✅ Handle multiple images safely
    let images = [];

    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => file.path);
    }

    // ✅ Create property
    const property = await Property.create({
      title,
      location,
      price,
      beds,
      baths,
      sqft,
      propertyType,
      description,
      badge,
      status,
      images,
      user: req.user?.id || null, // safe optional
    });

    // ✅ Response
    res.status(201).json({
      success: true,
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    console.error("Property Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};
// Add these functions to propertyController.js
exports.getUserProperties = async (req, res) => {
  try {
    // Get user ID from authenticated token (set by your auth middleware)
    const userId = req.user.id; // or req.user._id depending on your auth middleware
    
    // Find all properties belonging to this user
    const properties = await Property.find({ user: userId }).sort({ createdAt: -1 });
    
    // Calculate statistics
    const totalProperties = properties.length;
    const availableProperties = properties.filter(p => p.status === "available").length;
    const soldProperties = properties.filter(p => p.status === "sold").length;
    const totalAED = properties.reduce((sum, property) => sum + (property.price || 0), 0);
    
    res.status(200).json({
      success: true,
      properties,
      totalProperties,
      availableProperties,
      soldProperties,
      totalAED
    });
  } catch (error) {
    console.error("Error fetching user properties:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// ✅ GET SINGLE PROPERTY
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }
    
    res.status(200).json({
      success: true,
      property
    });
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ UPDATE PROPERTY
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }
    
    // Check if user owns this property (optional)
    if (property.user && property.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this property"
      });
    }
    
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      property: updatedProperty
    });
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ DELETE PROPERTY
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }
    
    // Check if user owns this property (optional)
    if (property.user && property.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this property"
      });
    }
    
    // Optional: Delete image files from uploads folder
    // You might want to implement this to clean up storage
    
    await property.deleteOne();
    
    res.status(200).json({
      success: true,
      message: "Property deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET ALL APPROVED PROPERTIES WITH USER DETAILS (ONLY FOR CUSTOMERS)
exports.getApprovedProperties = async (req, res) => {
  try {
    const properties = await Property.find({ approve: "approve" }) // only approved
      .populate("user", "name email phone") // populate user with selected fields
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: properties.length,
      properties,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};