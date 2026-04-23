const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
  {
    inquiryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inquiry",
      required: true,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    readByCustomer: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Reply", replySchema);