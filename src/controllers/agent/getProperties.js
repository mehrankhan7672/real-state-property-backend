const Property = require("../../models/agent/Property");

// ✅ GET ALL PROPERTIES FROM DATABASE (NO FILTERING)
exports.getAllProperties = async (req, res) => {
  try {
    // Get ALL properties from database without any user filter
    const properties = await Property.find()

    // Return all properties data
    res.status(200).json({
      success: true,
      properties: properties,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};