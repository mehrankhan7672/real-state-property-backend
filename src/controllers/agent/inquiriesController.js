const Inquiry = require("../../models/User/Inquiry");
const Property = require("../../models/agent/Property");

// Get all inquiries for agent's properties
const getAgentInquiries = async (req, res) => {
  try {
    const agentId = req.user.id; // Get authenticated agent's ID

    // Find all property IDs that belong to this agent
    const agentProperties = await Property.find({ user: agentId }).select("_id");

    if (agentProperties.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No properties found for this agent",
        inquiries: [],
        total: 0,
      });
    }

    // Extract property IDs
    const propertyIds = agentProperties.map(property => property._id);

    // Find all inquiries where propertyId is in the agent's property IDs
    const inquiries = await Inquiry.find({
      propertyId: { $in: propertyIds }
    })
    .populate("userId", "name email phone") // Get customer details
    .populate("propertyId", "title location price images") // Get property details
    .sort({ createdAt: -1 }); // Latest first

    res.status(200).json({
      success: true,
      count: inquiries.length,
      inquiries: inquiries,
    });
  } catch (error) {
    console.error("Error fetching agent inquiries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inquiries",
      error: error.message,
    });
  }
};

module.exports = { getAgentInquiries };