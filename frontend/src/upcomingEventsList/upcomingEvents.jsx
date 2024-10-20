import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { rrulestr } from "rrule";
import "../styles/upcomingEvents.css";
import {
  generateHumanReadableDescription,
  formatDate,
  formatTime,
} from "../sharedComponents/recurrenceFormatters";

function UpcomingEvents() {
  //definig states to manage and store list of events and current view mode
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState("week");
  const navigate = useNavigate();

  // Function to fetch all events from the API
  const fetchEvents = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }
      const response = await fetch("http://localhost:5001/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const processedEvents = processEvents(data);
        setEvents(processedEvents);
      } else {
        console.error("Error fetching events:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }, [viewMode]);

  //function to fetch events whenever the mode changes or the component starts
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  //function to process events and handle recurrence rules
  const processEvents = (data) => {
    const now = new Date();
    const endPeriod =
      viewMode === "week"
        ? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return (
      data
        .flatMap((event) => {
          if (event.recurrenceRule && event.recurrenceRule !== "null") {
            try {
              const rule = rrulestr(event.recurrenceRule);
              const occurrences = rule.between(now, endPeriod);
              return occurrences.map((date) => ({
                ...event,
                uniqueKey: `${event._id}-${date.getTime()}`,
                startDate: date.toISOString(),
                endDate: new Date(
                  new Date(date).getTime() +
                    (new Date(event.endDate) - new Date(event.startDate))
                ).toISOString(),
              }));
            } catch (error) {
              console.error(
                `Invalid recurrence rule: ${event.recurrenceRule}`,
                error
              );
              return [event];
            }
          }
          return [event];
        })

        //filter and store events based on their start and end dates
        .filter(
          (event) =>
            new Date(event.startDate) > now &&
            new Date(event.startDate) <= endPeriod
        )
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    );
  };

  //functions to handle butons on the event cars,
  const handleEdit = (event) => {
    navigate(`/editevent/${event.eventId}`);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5001/api/events/${eventId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          alert("Event deleted successfully!");
          fetchEvents();
        } else {
          alert("Failed to delete event.");
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Failed to delete event. Please try again.");
      }
    }
  };

  return (
    <div className="events-container">
      <h1 className="events-title">Upcoming Events</h1>
      <div className="view-toggle">
        {/* Buttons to toggle between week and month view */}
        <button
          onClick={() => setViewMode("week")}
          className={`toggle-btn ${viewMode === "week" ? "active" : ""}`}
        >
          This Week
        </button>
        <button
          onClick={() => setViewMode("month")}
          className={`toggle-btn ${viewMode === "month" ? "active" : ""}`}
        >
          This Month
        </button>
      </div>
      {/* Grid to display the list of events */}
      <div className="events-grid">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event.uniqueKey} className="event-item">
              <div className="event-header">
                <h2 className="event-title">{event.title}</h2>
                <div className="event-date">
                  {formatDate(event.startDate)} - {formatDate(event.endDate)}
                </div>
              </div>
              <div className="event-body">
                <div className="event-time">
                  {formatTime(event.startDate)} - {formatTime(event.endDate)}
                </div>
                {event.recurrenceRule && (
                  <div className="event-recurrence">
                    {generateHumanReadableDescription(event.recurrenceRule)}
                  </div>
                )}
                {event.details && (
                  <div className="event-details">{event.details}</div>
                )}
                <div className="event-actions">
                  <button
                    onClick={() => handleEdit(event)}
                    className="btn btn-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.eventId)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-events">
            No upcoming events found for the selected period.
          </p>
        )}
      </div>
    </div>
  );
}

export default UpcomingEvents;
