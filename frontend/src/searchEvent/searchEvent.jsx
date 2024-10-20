import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/searchEvents.css";
import {
  generateHumanReadableDescription,
  formatDate,
  formatTime,
} from "../sharedComponents/recurrenceFormatters";

function SearchEvents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5001/api/events", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          const filteredEvents = data.filter(
            (event) =>
              event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (event.details &&
                event.details
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())) ||
              (event.recurrenceRule &&
                generateHumanReadableDescription(event.recurrenceRule)
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()))
          );
          setSearchResults(filteredEvents);
        } else {
          console.error("Error fetching events");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    },
    [searchTerm]
  );

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
          handleSearch({ preventDefault: () => {} }); // Refresh search results
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
    <div className="search-container">
      <h2 className="search-title">Search Events</h2>
      <div className="search-form">
        <input
          type="text"
          className="search-input"
          placeholder="Search for events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
      </div>
      <div className="search-results">
        {searchResults.length > 0 ? (
          searchResults.map((event) => (
            <div key={event._id} className="event-card">
              <div className="event-card-header">
                <h3 className="event-card-title">{event.title}</h3>
              </div>
              <div className="event-card-body">
                <div className="event-card-detail">
                  <strong>Date:</strong> {formatDate(event.startDate)} -{" "}
                  {formatDate(event.endDate)}
                </div>
                <div className="event-card-detail">
                  <strong>Time:</strong> {formatTime(event.startDate)} -{" "}
                  {formatTime(event.endDate)}
                </div>
                {event.details && (
                  <div className="event-card-detail">
                    <strong>Details:</strong> {event.details}
                  </div>
                )}
                {event.recurrenceRule && (
                  <div className="event-card-recurrence">
                    {generateHumanReadableDescription(event.recurrenceRule)}
                  </div>
                )}
                <div className="event-actions">
                  <button
                    onClick={() => handleEdit(event)}
                    className="btn btn-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-results">No events found matching your search.</p>
        )}
      </div>
    </div>
  );
}

export default SearchEvents;
