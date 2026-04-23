const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  addReply,
  getRepliesByInquiry,
  getUnreadRepliesCount,
  getAgentAllReplies,
} = require("../controllers/agent/replyController");

// Protected routes
router.use(protect);

// Reply routes
router.post("/:inquiryId", addReply);
router.get("/:inquiryId", getRepliesByInquiry);
router.get("/unread/count", getUnreadRepliesCount);
router.get("/replies", getAgentAllReplies);

module.exports = router;