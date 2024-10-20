const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const auth = require("../middleware/auth");

// Create Event
router.post("/", auth, async (req, res) => {
  const { title, startDate, endDate, details, recurrenceRule, recurrenceType } =
    req.body;
  console.log("Event data received:", req.body); // Debug log
  try {
    const event = new Event({
      title,
      startDate,
      endDate,
      details,
      recurrenceRule,
      recurrenceType, // Add this line
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

// Delete event
router.delete("/:eventId", auth, async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ eventId: req.params.eventId });
    if (!event) {
      return res.status(404).send("Event not found");
    }
    res.send({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).send(error.message);
  }
});
// Search events
router.get("/search", auth, async (req, res) => {
  const { searchTerm } = req.query;
  console.log("Search term received:", searchTerm); // Debug log
  try {
    const events = await Event.find({ user: req.user._id });
    const filteredEvents = events.filter(
      (event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.details &&
          event.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (event.recurrenceRule &&
          formatRecurrenceRule(event.recurrenceRule)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
    );
    res.send(filteredEvents);
  } catch (error) {
    console.error("Error searching events:", error.message); // Debug log
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
