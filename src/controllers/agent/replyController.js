const Reply = require("../../models/agent/Reply");
const Inquiry = require("../../models/User/Inquiry");
const Property = require("../../models/agent/Property");

// Add reply to inquiry
const addReply = async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const { message } = req.body;
    const agentId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required",
      });
    }

    // Find the inquiry
    const inquiry = await Inquiry.findById(inquiryId);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    // Check if the property belongs to this agent
    const property = await Property.findOne({
      _id: inquiry.propertyId,
      user: agentId,
    });

    if (!property) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to reply to this inquiry",
      });
    }

    // Create reply
    const reply = new Reply({
      inquiryId: inquiryId,
      agentId: agentId,
      message: message.trim(),
    });

    await reply.save();

    // Update inquiry status to responded
    inquiry.status = "responded";
    await inquiry.save();

    res.status(200).json({
      success: true,
      message: "Reply sent successfully",
      data: reply,
    });
  } catch (error) {
    console.error("Error adding reply:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send reply",
      error: error.message,
    });
  }
};

// Get all replies for an inquiry
const getRepliesByInquiry = async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find the inquiry
    const inquiry = await Inquiry.findById(inquiryId);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    // Check permission
    const property = await Property.findById(inquiry.propertyId);
    
    const hasPermission = 
      userRole === "admin" || 
      inquiry.userId.toString() === userId || 
      (property && property.user.toString() === userId);

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view these replies",
      });
    }

    // Get all replies for this inquiry
    const replies = await Reply.find({ inquiryId: inquiryId })
      .populate("agentId", "name email")
      .sort({ createdAt: 1 }); // Oldest first

    // Mark replies as read for customer
    if (userRole === "customer") {
      await Reply.updateMany(
        { 
          inquiryId: inquiryId, 
          readByCustomer: false 
        },
        { 
          readByCustomer: true, 
          readAt: new Date() 
        }
      );
    }

    res.status(200).json({
      success: true,
      count: replies.length,
      data: replies,
    });
  } catch (error) {
    console.error("Error fetching replies:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch replies",
      error: error.message,
    });
  }
};

// Get unread reply count for customer
const getUnreadRepliesCount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all inquiries by this customer
    const inquiries = await Inquiry.find({ userId: userId });
    const inquiryIds = inquiries.map(inq => inq._id);

    // Count unread replies
    const unreadCount = await Reply.countDocuments({
      inquiryId: { $in: inquiryIds },
      readByCustomer: false,
    });

    res.status(200).json({
      success: true,
      count: unreadCount,
    });
  } catch (error) {
    console.error("Error fetching unread replies count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread replies count",
      error: error.message,
    });
  }
};

// Get all replies for agent's inquiries
const getAgentAllReplies = async (req, res) => {
  try {
    const agentId = req.user.id;

    // Find all properties belonging to agent
    const properties = await Property.find({ user: agentId });
    const propertyIds = properties.map(prop => prop._id);

    // Find all inquiries for these properties
    const inquiries = await Inquiry.find({ 
      propertyId: { $in: propertyIds } 
    });
    const inquiryIds = inquiries.map(inq => inq._id);

    // Get all replies for these inquiries
    const replies = await Reply.find({ 
      inquiryId: { $in: inquiryIds } 
    })
    .populate("inquiryId", "message userId propertyId")
    .populate("agentId", "name email")
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: replies.length,
      data: replies,
    });
  } catch (error) {
    console.error("Error fetching agent replies:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch replies",
      error: error.message,
    });
  }
};

module.exports = {
  addReply,
  getRepliesByInquiry,
  getUnreadRepliesCount,
  getAgentAllReplies,
};