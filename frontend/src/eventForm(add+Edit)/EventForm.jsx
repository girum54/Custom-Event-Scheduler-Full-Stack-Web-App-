//importing required packages
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

//import shared component to use, for reusability and efficiency
import {
  generateHumanReadableDescription,
  generateRRule,
  parseRRule,
} from "../sharedComponents/recurrenceFormatters";

//main function of event form component
const EventForm = () => {
  //defining variables and states to be used
  const [isEditMode, setIsEditMode] = useState(false);
  const [eventData, setEventData] = useState({
    title: "",
    details: "",
    startDateTime: "",
    endDateTime: "",
    recurrenceType: "",
    standardRecurrence: "",
    specificDates: [],
    specificInterval: {
      number: null,
      type: "",
    },
    relativeDate: {
      week: "",
      day: "",
    },
    relativeYearlyDate: {
      month: 1,
      week: "",
      day: "",
    },
  });

  const [errors, setErrors] = useState({});
  const [description, setDescription] = useState("");
  const { eventId } = useParams();
  const navigate = useNavigate();

  //code logic for automatic toggle between edit mode and create mode
  useEffect(() => {
    if (eventId) {
      setIsEditMode(true);
      fetchEventData(eventId);
    }
  }, [eventId]);

  useEffect(() => {
    if (!eventId) {
      // Only reset when there is no eventId (Add Event)
      resetFormState();
      setIsEditMode(false);
    }
  }, [eventId]);

  //reset form when complete
  const resetFormState = () => {
    setEventData({
      title: "",
      details: "",
      startDateTime: "",
      endDateTime: "",
      recurrenceType: "",
      standardRecurrence: "",
      specificDates: [],
      specificInterval: { number: null, type: "" },
      relativeDate: { week: "", day: "" },
      relativeYearlyDate: { month: 1, week: "", day: "" },
    });
    setDescription("");
  };

  //fetch data from database for editing
  const fetchEventData = async (eventId) => {
    try {
      //secret token used to authenticate user access to database
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
        setEventData((prevData) => ({
          ...prevData,
          ...data,
          title: data.title,
          details: data.details,
          startDateTime: formatDateTime(data.startDate),
          endDateTime: formatDateTime(data.endDate),
        }));
        const parsedData = parseRRule(data.recurrenceRule);
        setEventData((prevData) => ({
          ...prevData,
          ...parsedData,
        }));
        //description set by using shared component that sets human readable descriptions from RRULE
        setDescription(generateHumanReadableDescription(data.recurrenceRule));
      } else {
        console.error("Error fetching event data");
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
    }
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toISOString().slice(0, 16);
  };

  //form validation to make sure details are entered correctly
  const validateForm = () => {
    let newErrors = {};

    if (!eventData.title.trim()) newErrors.title = "Title is required";
    if (!eventData.startDateTime)
      newErrors.startDateTime = "Start date and time is required";
    if (!eventData.endDateTime)
      newErrors.endDateTime = "End date and time is required";

    if (eventData.startDateTime && eventData.endDateTime) {
      if (
        new Date(eventData.endDateTime) <= new Date(eventData.startDateTime)
      ) {
        newErrors.endDateTime =
          "End date and time must be after start date and time";
      }
    }

    if (
      eventData.recurrenceType === "specific_interval" &&
      eventData.specificInterval.number < 1
    ) {
      newErrors.specificInterval = "Interval must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData((prevData) => {
      const newData = { ...prevData };
      if (name.includes(".")) {
        const [objName, key] = name.split(".");
        newData[objName] = {
          ...newData[objName],
          [key]: value,
        };
      } else {
        newData[name] = value;
      }
      return newData;
    });
  };

  const handleInputChangeWithValidation = (e) => {
    const { name, value } = e.target;
    handleInputChange(e);

    if (name === "startDateTime" || name === "endDateTime") {
      const start = name === "startDateTime" ? value : eventData.startDateTime;
      const end = name === "endDateTime" ? value : eventData.endDateTime;
      if (start && end && new Date(end) <= new Date(start)) {
        setErrors((prev) => ({
          ...prev,
          endDateTime: "End date and time must be after start date and time",
        }));
      } else {
        setErrors((prev) => ({ ...prev, endDateTime: undefined }));
      }
    }

    if (name === "specificInterval.number") {
      if (parseInt(value) < 1) {
        setErrors((prev) => ({
          ...prev,
          specificInterval: "Interval must be at least 1",
        }));
      } else {
        setErrors((prev) => ({ ...prev, specificInterval: undefined }));
      }
    }
  };

  const handleRecurrenceTypeChange = (e) => {
    const { value } = e.target;
    setEventData((prevData) => ({
      ...prevData,
      recurrenceType: value,
      standardRecurrence: "daily",
      specificDates: [],
      specificInterval: {
        number: 1,
        type: "daily",
      },
      relativeDate: {
        week: "first",
        day: "monday",
      },
      relativeYearlyDate: {
        month: 1,
        week: "first",
        day: "monday",
      },
    }));
    setDescription("");
  };

  //recurrence type and recurrence detailed options are defined here
  const renderRecurrenceOptions = () => {
    switch (eventData.recurrenceType) {
      case "standard":
        return (
          <div className="form-group">
            <label className="form-label">Standard Recurrence:</label>
            <select
              name="standardRecurrence"
              value={eventData.standardRecurrence}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        );
      case "specific_dates":
        return (
          <div className="form-group">
            <label className="form-label">Specific Dates Recurrence:</label>
            <div className="checkbox-group">
              {[
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
              ].map((day) => (
                <label key={day} className="checkbox-label">
                  <input
                    type="checkbox"
                    name="specificDates"
                    value={day}
                    checked={eventData.specificDates.includes(day)}
                    onChange={(e) => {
                      const { checked, value } = e.target;
                      setEventData((prevData) => ({
                        ...prevData,
                        specificDates: checked
                          ? [...prevData.specificDates, value]
                          : prevData.specificDates.filter((d) => d !== value),
                      }));
                    }}
                    className="checkbox-input"
                  />
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </label>
              ))}
            </div>
          </div>
        );
      case "specific_interval":
        return (
          <div className="form-group">
            <label className="form-label">Specific Interval Recurrence:</label>
            <input
              type="number"
              name="specificInterval.number"
              value={eventData.specificInterval.number}
              onChange={handleInputChange}
              min="1"
              className={`form-control ${
                errors.specificInterval ? "is-invalid" : ""
              }`}
            />
            {errors.specificInterval && (
              <div className="invalid-feedback">{errors.specificInterval}</div>
            )}
            <select
              name="specificInterval.type"
              value={eventData.specificInterval.type}
              onChange={(e) =>
                setEventData((prevData) => ({
                  ...prevData,
                  specificInterval: {
                    ...prevData.specificInterval,
                    type: e.target.value,
                  },
                }))
              }
              className="form-control"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        );
      case "relative_date":
        return (
          <div className="form-group">
            <label className="form-label">Relative Date Recurrence:</label>
            <select
              name="relativeDate.week"
              value={eventData.relativeDate.week}
              onChange={(e) =>
                setEventData((prevData) => ({
                  ...prevData,
                  relativeDate: {
                    ...prevData.relativeDate,
                    week: e.target.value,
                  },
                }))
              }
              className="form-control"
            >
              <option value="first">First</option>
              <option value="second">Second</option>
              <option value="third">Third</option>
              <option value="fourth">Fourth</option>
              <option value="fifth">Fifth</option>
              <option value="last">Last</option>
            </select>
            <select
              name="relativeDate.day"
              value={eventData.relativeDate.day}
              onChange={(e) =>
                setEventData((prevData) => ({
                  ...prevData,
                  relativeDate: {
                    ...prevData.relativeDate,
                    day: e.target.value,
                  },
                }))
              }
              className="form-control"
            >
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
              <option value="other">Other</option>
            </select>
            {eventData.relativeDate.day === "other" && (
              <select
                name="relativeDate.otherDay"
                value={eventData.relativeDate.otherDay}
                onChange={(e) =>
                  setEventData((prevData) => ({
                    ...prevData,
                    relativeDate: {
                      ...prevData.relativeDate,
                      otherDay: e.target.value,
                    },
                  }))
                }
                className="form-control"
              >
                <option value="weekday">Weekday</option>
                <option value="weekend">Weekend</option>
              </select>
            )}
          </div>
        );
      case "relative_yearly_date":
        return (
          <div className="form-group">
            <label className="form-label">
              Relative Yearly Date Recurrence:
            </label>
            <select
              name="relativeYearlyDate.month"
              value={eventData.relativeYearlyDate.month}
              onChange={(e) =>
                setEventData((prevData) => ({
                  ...prevData,
                  relativeYearlyDate: {
                    ...prevData.relativeYearlyDate,
                    month: parseInt(e.target.value),
                  },
                }))
              }
              className="form-control"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>
                  {new Date(2000, i, 1).toLocaleString("default", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
            <select
              name="relativeYearlyDate.week"
              value={eventData.relativeYearlyDate.week}
              onChange={(e) =>
                setEventData((prevData) => ({
                  ...prevData,
                  relativeYearlyDate: {
                    ...prevData.relativeYearlyDate,
                    week: e.target.value,
                  },
                }))
              }
              className="form-control"
            >
              <option value="first">First</option>
              <option value="second">Second</option>
              <option value="third">Third</option>
              <option value="fourth">Fourth</option>
              <option value="fifth">Fifth</option>
              <option value="last">Last</option>
            </select>
            <select
              name="relativeYearlyDate.day"
              value={eventData.relativeYearlyDate.day}
              onChange={(e) =>
                setEventData((prevData) => ({
                  ...prevData,
                  relativeYearlyDate: {
                    ...prevData.relativeYearlyDate,
                    day: e.target.value,
                  },
                }))
              }
              className="form-control"
            >
              <option value="sunday">Sunday</option>
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
              <option value="other">Other</option>
            </select>
            {eventData.relativeYearlyDate.day === "other" && (
              <select
                name="relativeYearlyDate.otherDay"
                value={eventData.relativeYearlyDate.otherDay}
                onChange={(e) =>
                  setEventData((prevData) => ({
                    ...prevData,
                    relativeYearlyDate: {
                      ...prevData.relativeYearlyDate,
                      otherDay: e.target.value,
                    },
                  }))
                }
                className="form-control"
              >
                <option value="weekday">Weekday</option>
                <option value="weekend">Weekend</option>
              </select>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  //function used to create event and upload to database on success
  const createEvent = async (eventDataToSubmit) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5001/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventDataToSubmit),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Event created successfully:", data);
        navigate("/upcomingevents"); // Redirect to events list
      } else {
        console.error("Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  //function used to edit event details and upload to database on success
  const updateEvent = async (eventId) => {
    try {
      const rrule = generateRRule(eventData);
      const description = generateHumanReadableDescription(rrule);

      const eventDataToSubmit = {
        title: eventData.title,
        details: eventData.details,
        startDate: eventData.startDateTime,
        endDate: eventData.endDateTime,
        recurrenceType: eventData.recurrenceType,
        recurrenceRule: rrule,
      };

      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5001/api/events/${eventId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(eventDataToSubmit), // Correct payload
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Event updated successfully:", data);
        navigate("/upcomingevents"); // Redirect to upcoming events
      } else {
        console.error("Failed to update event");
      }
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const rrule = generateRRule(eventData);
      const description = generateHumanReadableDescription(rrule);
      await new Promise((resolve) => {
        setDescription(description);
        setEventData((prevData) => {
          const newEventData = {
            ...prevData,
            recurrenceRule: rrule,
          };
          resolve(newEventData);
          return newEventData;
        });
      });

      const eventDataToSubmit = {
        title: eventData.title,
        details: eventData.details,
        startDate: eventData.startDateTime,
        endDate: eventData.endDateTime,
        recurrenceType: eventData.recurrenceType,
        recurrenceRule: rrule,
      };
      console.log("Updating Event with Data: ", eventDataToSubmit);

      if (isEditMode) {
        updateEvent(eventId, eventDataToSubmit);
      } else {
        createEvent(eventDataToSubmit);
      }
    } else {
      console.log("Form has errors");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>{isEditMode ? "Edit Event" : "Create New Event"}</h2>

      <div className="form-group">
        <label className="form-label">Event Title:</label>
        <input
          type="text"
          name="title"
          value={eventData.title}
          onChange={handleInputChangeWithValidation}
          className={`form-control ${errors.title ? "is-invalid" : ""}`}
          required
        />
        {errors.title && <div className="invalid-feedback">{errors.title}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Event Details:</label>
        <textarea
          name="details"
          value={eventData.details}
          onChange={handleInputChange}
          className="form-control"
          rows="3"
        ></textarea>
      </div>

      <div className="form-group">
        <label className="form-label">Start Date and Time:</label>
        <input
          type="datetime-local"
          name="startDateTime"
          value={eventData.startDateTime}
          onChange={handleInputChangeWithValidation}
          className={`form-control ${errors.startDateTime ? "is-invalid" : ""}`}
          required
        />
        {errors.startDateTime && (
          <div className="invalid-feedback">{errors.startDateTime}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">End Date and Time:</label>
        <input
          type="datetime-local"
          name="endDateTime"
          value={eventData.endDateTime}
          onChange={handleInputChangeWithValidation}
          className={`form-control ${errors.endDateTime ? "is-invalid" : ""}`}
          required
        />
        {errors.endDateTime && (
          <div className="invalid-feedback">{errors.endDateTime}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Recurrence Type:</label>
        <select
          name="recurrenceType"
          value={eventData.recurrenceType}
          onChange={handleRecurrenceTypeChange}
          className="form-control"
        >
          <option value="single">Single Recurrence</option>
          <option value="standard">Standard Recurrence</option>
          <option value="specific_dates">Specific Dates Recurrence</option>
          <option value="specific_interval">
            Specific Interval Recurrence
          </option>
          <option value="relative_date">Relative Date Recurrence</option>
          <option value="relative_yearly_date">
            Relative Yearly Date Recurrence
          </option>
        </select>
      </div>

      {renderRecurrenceOptions()}

      {description && (
        <div className="form-group">
          <label className="form-label">Recurrence Description:</label>
          <p>{description}</p>
        </div>
      )}

      <button type="submit" className="btn-primary">
        {isEditMode ? "Update Event" : "Create Event"}
      </button>
    </form>
  );
};
export default EventForm;
