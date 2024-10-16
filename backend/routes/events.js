const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const auth = require("../middleware/auth");

// Create Event
router.post("/", auth, async (req, res) => {
  const { title, startDate, endDate, details, recurrenceRule } = req.body;
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

module.exports = router;
