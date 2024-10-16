import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { rrulestr } from "rrule";
import "../styles/addEvent.css";

function EditEvent() {
  const { eventId } = useParams();
  console.log("eventId from URL:", eventId); // Debug log

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [details, setDetails] = useState("");
  const [recurrenceType, setRecurrenceType] = useState("");
  const [nthType, setNthType] = useState("");
  const [recurrenceInterval, setRecurrenceInterval] = useState("");
  const [specificDays, setSpecificDays] = useState([]);
  const [relativeDate, setRelativeDate] = useState("");
  const [recurrenceRule, setRecurrenceRule] = useState("");

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toISOString().slice(0, 16);
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5001/api/events/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setTitle(data.title);
          setStartDate(formatDateTime(data.startDate));
          setEndDate(formatDateTime(data.endDate));
          setDetails(data.details);
          setRecurrenceRule(data.recurrenceRule);

          // Parse recurrence rule to set recurrenceType and other details
          const rule = rrulestr(data.recurrenceRule);
          setRecurrenceType(rule.origOptions.freq);
          if (rule.origOptions.interval) {
            setRecurrenceInterval(rule.origOptions.interval);
          }
          if (rule.origOptions.byweekday) {
            setSpecificDays(
              rule.origOptions.byweekday.map((day) =>
                day.toString().substring(0, 2).toUpperCase()
              )
            );
          }
          if (rule.origOptions.bymonthday) {
            setRelativeDate(rule.origOptions.bymonthday);
          }
        } else {
          console.error("Error fetching event data");
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const handleSpecificDaysChange = (e) => {
    const { value, checked } = e.target;
    setSpecificDays((prev) =>
      checked ? [...prev, value] : prev.filter((day) => day !== value)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const recurrenceRule = createRecurrenceRule();
    console.log("Recurrence Rule:", recurrenceRule);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5001/api/events/${eventId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            startDate,
            endDate,
            details,
            recurrenceRule,
          }),
        }
      );
      if (response.ok) {
        alert("Event updated successfully!");
      } else {
        alert("Event not found or update failed.");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Error updating event. Please try again.");
    }
  };

  const createRecurrenceRule = () => {
    let recurrenceRule = null;
    if (recurrenceType) {
      switch (recurrenceType) {
        case "daily":
          recurrenceRule = `RRULE:FREQ=DAILY`;
          break;
        case "weekly":
          recurrenceRule = `RRULE:FREQ=WEEKLY;BYDAY=${specificDays.join(",")}`;
          break;
        case "monthly":
          recurrenceRule = `RRULE:FREQ=MONTHLY;BYMONTHDAY=${recurrenceInterval}`;
          break;
        case "yearly":
          recurrenceRule = `RRULE:FREQ=YEARLY`;
          break;
        case "nth":
          recurrenceRule = `RRULE:FREQ=${nthType.toUpperCase()};INTERVAL=${recurrenceInterval}`;
          break;
        case "specificDays":
          recurrenceRule = `RRULE:FREQ=WEEKLY;BYDAY=${specificDays.join(",")}`;
          break;
        case "relativeDate":
          recurrenceRule = `RRULE:${relativeDate}`;
          break;
        default:
          recurrenceRule = `RRULE:FREQ=DAILY`;
          break;
      }
    }
    return recurrenceRule;
  };

  return (
    <div className="form-container">
      <h2>Edit Event</h2>
      <form onSubmit={handleSubmit}>
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
          <label className="form-label">Recurrence</label>
          <select
            className="form-control"
            value={recurrenceType}
            onChange={(e) => setRecurrenceType(e.target.value)}
          >
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
          Update Event
        </button>
      </form>
    </div>
  );
}

export default EditEvent;
