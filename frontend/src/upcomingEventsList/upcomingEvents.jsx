import React, { useEffect, useState, useCallback } from "react";
import { RRule, rrulestr } from "rrule";
import "../styles/upcomingEvents.css";

// UpcomingEvents component
function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState("week"); // 'week' or 'month'

  // Fetch events when component mounts
  const fetchEvents = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      console.log("Fetching events with token:", token);
      const response = await fetch("http://localhost:5001/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched data:", data);
        const processedEvents = processEvents(data);
        console.log("Processed events:", processedEvents);
        setEvents(processedEvents);
      } else {
        const errorText = await response.text();
        console.error("Error fetching events:", errorText);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents, viewMode]);

  const processEvents = (data) => {
    console.log("Processing events");
    const now = new Date();
    const endPeriod =
      viewMode === "week"
        ? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return data
      .flatMap((event) => {
        if (event.recurrenceRule && event.recurrenceRule !== "null") {
          try {
            const rule = rrulestr(event.recurrenceRule);
            const occurrences = rule.between(now, endPeriod);
            return occurrences.map((date) => ({
              ...event,
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
      .filter((event) => {
        const eventDate = new Date(event.startDate);
        console.log("Event date:", eventDate);
        console.log("End period:", endPeriod);
        return eventDate > now && eventDate <= endPeriod;
      })
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  };

  const formatRecurrenceRule = (rule) => {
    const rrule = RRule.fromString(rule);
    const freq = RRule.FREQUENCIES[rrule.options.freq];
    const interval = rrule.options.interval;
    const days =
      rrule.options.byweekday &&
      rrule.options.byweekday.map((day) => RRule.DAYS[day.weekday]);
    let formattedRule = "";
    switch (freq) {
      case "DAILY":
        formattedRule = `Every ${interval} day(s)`;
        break;
      case "WEEKLY":
        formattedRule = `Every ${interval} week(s) on ${days.join(", ")}`;
        break;
      case "MONTHLY":
        formattedRule = `Every ${interval} month(s)`;
        break;
      case "YEARLY":
        formattedRule = `Every ${interval} year(s)`;
        break;
      default:
        formattedRule = rule;
    }
    return formattedRule;
  };

  return (
    <div className="container">
      <h2>Upcoming Events</h2>
      <div>
        <button
          onClick={() => setViewMode("week")}
          className={`btn ${viewMode === "week" ? "active" : ""}`}
        >
          This Week
        </button>
        <button
          onClick={() => setViewMode("month")}
          className={`btn ${viewMode === "month" ? "active" : ""}`}
        >
          This Month
        </button>
      </div>
      {events.length > 0 ? (
        events.map((event) => (
          <div key={event._id} className="event-card">
            <h3>{event.title}</h3>
            <p>Start: {new Date(event.startDate).toLocaleString()}</p>
            <p>End: {new Date(event.endDate).toLocaleString()}</p>
            {event.details && <p>Details: {event.details}</p>}
            {event.recurrenceRule && (
              <p>Recurrence: {formatRecurrenceRule(event.recurrenceRule)}</p>
            )}
          </div>
        ))
      ) : (
        <p>No upcoming events found for the selected period.</p>
      )}
    </div>
  );
}

export default UpcomingEvents;
