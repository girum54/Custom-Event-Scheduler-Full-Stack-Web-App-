const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const auth = require("../middleware/auth");

// Create Event
router.post("/", auth, async (req, res) => {
  const { title, startDate, endDate, details, recurrenceRule } = req.body;
  console.log("Event data received:", req.body); // Debug log
  try {
    const event = new Event({
      title,
      startDate,
      endDate,
      details,
      recurrenceRule,
      user: req.user._id,
    });
    await event.save();
    res.status(201).send(event);
  } catch (error) {
    console.error("Error creating event:", error.message); // Debug log
    res.status(400).send({ error: error.message });
  }
});

// Fetch Events
router.get("/", auth, async (req, res) => {
  try {
    const events = await Event.find({ user: req.user._id });
    console.log("Events from DB:", events); // Debug log
    res.send(events);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Get event by ID
router.get("/:eventId", auth, async (req, res) => {
  try {
    const event = await Event.findOne({ eventId: req.params.eventId });
    if (!event) {
      return res.status(404).send("Event not found");
    }
    res.send(event);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Update event
router.put("/:eventId", auth, async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { eventId: req.params.eventId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!event) {
      return res.status(404).send("Event not found");
    }
    res.send(event);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
