const mongoose = require('mongoose');
const Inquiry = require('../../models/User/Inquiry');
const Property = require('../../models/agent/Property');
const User = require('../../models/User/user');
// Create a new inquiry (STORE)
exports.createInquiry = async (req, res) => {
  try {
    const { userId, propertyId, message, location, contactNumber } = req.body;

    // Validate required fields
    if (!userId || !propertyId || !message) {
      return res.status(400).json({
        success: false,
        message: 'userId, propertyId, and message are required'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid userId format'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid propertyId format'
      });
    }

    const inquiry = new Inquiry({
      userId,
      propertyId,
      message,
      location,
      contactNumber
    });

    await inquiry.save();

    res.status(201).json({
      success: true,
      message: 'Inquiry stored successfully',
      data: inquiry
    });

  } catch (error) {
    console.error('Error creating inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to store inquiry',
      error: error.message
    });
  }
};

// Get all inquiries (READ ALL)
exports.getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .populate('userId', 'name email phone ') // Populate user details
      .populate('propertyId', 'title location price images') // Populate property details
      .sort({ createdAt: -1 }); // Most recent first

    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });

  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries',
      error: error.message
    });
  }
};

// Get single inquiry by ID (READ ONE)
exports.getInquiryById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inquiry ID format'
      });
    }

    const inquiry = await Inquiry.findById(id)
      .populate('userId', 'name email phone')
      .populate('propertyId', 'title location price images description');

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      data: inquiry
    });

  } catch (error) {
    console.error('Error fetching inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiry',
      error: error.message
    });
  }
};

// Update inquiry (UPDATE)
exports.updateInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inquiry ID format'
      });
    }

    // Validate message
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required for update'
      });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      id,
      { 
        message, 
        updatedAt: Date.now() 
      },
      { 
        new: true, // Return updated document
        runValidators: true 
      }
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry updated successfully',
      data: inquiry
    });

  } catch (error) {
    console.error('Error updating inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inquiry',
      error: error.message
    });
  }
};

// Delete inquiry (DELETE)
exports.deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inquiry ID format'
      });
    }

    const inquiry = await Inquiry.findByIdAndDelete(id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete inquiry',
      error: error.message
    });
  }
};

// Get inquiries by user ID
exports.getInquiriesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const inquiries = await Inquiry.find({ userId })
      .populate('userId', 'name email phone')
      .populate('propertyId', 'title location price images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });

  } catch (error) {
    console.error('Error fetching user inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user inquiries',
      error: error.message
    });
  }
};

// Get inquiries by property ID
exports.getInquiriesByProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID format'
      });
    }

    const inquiries = await Inquiry.find({ propertyId })
      .populate('userId', 'name email phone')
      .populate('propertyId', 'title location price images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });

  } catch (error) {
    console.error('Error fetching property inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property inquiries',
      error: error.message
    });
  }
};