const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    beds: {
      type: Number,
      default: 0,
    },
    baths: {
      type: Number,
      default: 0,
    },
    sqft: {
      type: String,
    },
    propertyType: {
      type: String,
      enum: ["apartment", "villa", "townhouse", "penthouse", "house"],
      default: "apartment",
    },
    description: {
      type: String,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
    badge: {
      type: String,
      default: "New",
    },
    status: {
      type: String,
      enum: ["available", "pending", "sold"],
      default: "available",
    },
    approve:{
      type:String,
      default:"pending",
      enum: ["pending","approve","rejected"],
    },
    // Optional: Add user field if you want to track which agent added the property
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Make it optional for now
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);