const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const eventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    default: uuidv4,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  recurrenceRule: {
    type: String,
    default: "",
  },
  recurrenceType: {
    type: String, // You can change the type as needed, e.g., enum for predefined types
    default: "",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
