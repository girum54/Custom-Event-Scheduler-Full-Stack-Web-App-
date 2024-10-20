import React, { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useNavigate } from "react-router-dom";
import { rrulestr } from "rrule";
import "../styles/viewAllEvents.css";
import {
  generateHumanReadableDescription,
  formatDate,
  formatTime,
} from "../sharedComponents/recurrenceFormatters";

// Function to generate a random color for event display
const generateRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

function ViewAllEvents() {
  // State to store the list of events
  const [events, setEvents] = useState([]);
  // State to manage the visibility of the modal
  const [showModal, setShowModal] = useState(false);
  // State to store the selected event details
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  // Function to fetch events from the API
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
        const now = new Date();
        const endPeriod = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
        const processedEvents = data.flatMap((event) => {
          const eventColor = generateRandomColor();
          if (event.recurrenceRule && event.recurrenceRule !== "null") {
            try {
              const rule = rrulestr(event.recurrenceRule);
              const occurrences = rule.between(now, endPeriod);
              return occurrences.map((date) => ({
                ...event,
                title: event.title,
                start: date.toISOString(),
                end: new Date(
                  new Date(date).getTime() +
                    (new Date(event.endDate) - new Date(event.startDate))
                ).toISOString(),
                backgroundColor: eventColor,
                borderColor: eventColor,
              }));
            } catch (error) {
              console.error(
                `Invalid recurrence rule: ${event.recurrenceRule}`,
                error
              );
              return [
                {
                  ...event,
                  backgroundColor: eventColor,
                  borderColor: eventColor,
                },
              ];
            }
          }
          return [
            {
              ...event,
              title: event.title,
              start: event.startDate,
              end: event.endDate,
              backgroundColor: eventColor,
              borderColor: eventColor,
            },
          ];
        });
        setEvents(processedEvents);
      } else {
        console.error("Error fetching events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }, []);

  // Fetch events when the component mounts
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Function to handle event click in the calendar
  const handleEventClick = (clickInfo) => {
    const eventDetails = {
      ...clickInfo.event.extendedProps,
      title: clickInfo.event.title,
      start: clickInfo.event.startDate,
      end: clickInfo.event.endDate,
    };
    setSelectedEvent(eventDetails);
    setShowModal(true);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  // Function to handle editing an event
  const handleEdit = (event) => {
    navigate(`/editevent/${event.eventId}`);
    handleCloseModal();
  };

  // Function to handle deleting an event
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
          handleCloseModal();
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
    <div className="calendar-container">
      <h2 className="calendar-title">All Events</h2>
      {/* FullCalendar component to display events */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        eventClick={handleEventClick}
      />
      {/* Modal to display event details */}
      {selectedEvent && (
        <div className="modal-container">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{selectedEvent.title}</h3>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                <strong>Start Date: </strong>
                {formatDate(selectedEvent.startDate) +
                  " " +
                  formatTime(selectedEvent.startDate)}
              </p>
              <p>
                <strong>End Date: </strong>
                {formatDate(selectedEvent.endDate) +
                  " " +
                  formatTime(selectedEvent.startDate)}
              </p>
              <p>
                <strong>Details:</strong> {selectedEvent.details}
              </p>
              {selectedEvent.recurrenceRule && (
                <p>
                  <strong>
                    {generateHumanReadableDescription(
                      selectedEvent.recurrenceRule
                    )}
                  </strong>{" "}
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary modal-button"
                onClick={() => handleEdit(selectedEvent)}
              >
                Edit
              </button>
              <button
                className="btn-danger modal-button"
                onClick={() => handleDelete(selectedEvent.eventId)}
              >
                Delete
              </button>
              <button className="modal-button" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewAllEvents;
