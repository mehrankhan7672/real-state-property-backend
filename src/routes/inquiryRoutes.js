const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/userController/inquiryController');

// Create a new inquiry (STORE)
router.post('/inquiries', inquiryController.createInquiry);

// Get all inquiries (READ ALL)
router.get('/inquiries', inquiryController.getAllInquiries);

// Get single inquiry by ID (READ ONE)
router.get('/inquiries/:id', inquiryController.getInquiryById);

// Update inquiry by ID (UPDATE)
router.put('/inquiries/:id', inquiryController.updateInquiry);

// Delete inquiry by ID (DELETE)
router.delete('/inquiries/:id', inquiryController.deleteInquiry);

// Get inquiries by user ID
router.get('/inquiries/user/:userId', inquiryController.getInquiriesByUser);

// Get inquiries by property ID
router.get('/inquiries/property/:propertyId', inquiryController.getInquiriesByProperty);

module.exports = router;