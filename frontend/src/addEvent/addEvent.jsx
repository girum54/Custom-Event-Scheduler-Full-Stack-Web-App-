import React, { useState } from "react";
import "../styles/addEvent.css";

function AddEvent({ fetchEvents }) {
  // Define state variables for event details
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [details, setDetails] = useState(""); // New state for details
  const [recurrenceType, setRecurrenceType] = useState("");
  const [nthType, setNthType] = useState("");
  const [recurrenceInterval, setRecurrenceInterval] = useState("");
  const [specificDays, setSpecificDays] = useState([]);
  const [relativeDate, setRelativeDate] = useState("");

  // Handle changes for specific days checkboxes
  const handleSpecificDaysChange = (e) => {
    const { value, checked } = e.target;
    setSpecificDays((prev) =>
      checked ? [...prev, value] : prev.filter((day) => day !== value)
    );
  };

  return (
    <div className="form-container">
      <h2>Add New Event</h2>
      <form>
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Event Title
          </label>
          <input
            type="text"
            className="form-control"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="startDate" className="form-label">
            Start Date
          </label>
          <input
            type="datetime-local"
            className="form-control"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate" className="form-label">
            End Date
          </label>
          <input
            type="datetime-local"
            className="form-control"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          {" "}
          {/* New form group for details */}
          <label htmlFor="details" className="form-label">
            Event Details
          </label>
          <textarea
            className="form-control"
            id="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="recurrenceType" className="form-label">
            Recurrence Type
          </label>
          <select
            className="form-control"
            id="recurrenceType"
            value={recurrenceType}
            onChange={(e) => setRecurrenceType(e.target.value)}
          >
            <option value="">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="nth">Every N-th</option>
            <option value="specificDays">Specific Days</option>
            <option value="relativeDate">Relative Date</option>
          </select>
        </div>
        {recurrenceType === "nth" && (
          <div className="form-group">
            <label htmlFor="nthType" className="form-label">
              Nth Type
            </label>
            <select
              className="form-control"
              id="nthType"
              value={nthType}
              onChange={(e) => setNthType(e.target.value)}
            >
              <option value="daily">Day</option>
              <option value="weekly">Week</option>
              <option value="monthly">Month</option>
              <option value="yearly">Year</option>
            </select>
            <label htmlFor="recurrenceInterval" className="form-label">
              Interval (N)
            </label>
            <input
              type="number"
              className="form-control"
              id="recurrenceInterval"
              value={recurrenceInterval}
              onChange={(e) => setRecurrenceInterval(e.target.value)}
            />
          </div>
        )}
        {recurrenceType === "specificDays" && (
          <div className="form-group">
            <label htmlFor="specificDays" className="form-label">
              Days of the Week
            </label>
            <div>
              <input
                type="checkbox"
                value="MO"
                onChange={handleSpecificDaysChange}
              />{" "}
              Monday
              <input
                type="checkbox"
                value="TU"
                onChange={handleSpecificDaysChange}
              />{" "}
              Tuesday
              <input
                type="checkbox"
                value="WE"
                onChange={handleSpecificDaysChange}
              />{" "}
              Wednesday
              <input
                type="checkbox"
                value="TH"
                onChange={handleSpecificDaysChange}
              />{" "}
              Thursday
              <input
                type="checkbox"
                value="FR"
                onChange={handleSpecificDaysChange}
              />{" "}
              Friday
              <input
                type="checkbox"
                value="SA"
                onChange={handleSpecificDaysChange}
              />{" "}
              Saturday
              <input
                type="checkbox"
                value="SU"
                onChange={handleSpecificDaysChange}
              />{" "}
              Sunday
            </div>
          </div>
        )}
        {recurrenceType === "relativeDate" && (
          <div className="form-group">
            <label htmlFor="relativeDate" className="form-label">
              Relative Date
            </label>
            <input
              type="text"
              className="form-control"
              id="relativeDate"
              value={relativeDate}
              onChange={(e) => setRelativeDate(e.target.value)}
              placeholder="e.g., second Friday"
            />
          </div>
        )}
        <button type="submit" className="btn btn-primary">
          Add Event
        </button>
      </form>
    </div>
  );
}

export default AddEvent;
