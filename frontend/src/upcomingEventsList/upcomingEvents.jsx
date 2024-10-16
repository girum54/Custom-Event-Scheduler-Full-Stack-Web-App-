import React, { useEffect, useState, useCallback } from "react";
import { RRule, rrulestr } from "rrule";
import "../styles/upcomingEvents.css";

// UpcomingEventsList component
function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState("week"); // 'week' or 'month'

  // useCallback hook ensures fetchEvents function is memoized and stable
  const fetchEvents = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }
      console.log("Fetching events with token:", token); // Debug log
      const response = await fetch("http://localhost:5001/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched data:", data); // Debug log
        const processedEvents = processEvents(data);
        console.log("Processed events:", processedEvents); // Debug log
        setEvents(processedEvents);
      } else {
        const errorText = await response.text();
        console.error("Error fetching events:", errorText);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }, [viewMode]);

  // Fetch events when component mounts
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Process events to handle recurrence rules and filter future events based on view mode
  const processEvents = (data) => {
    console.log("Processing events"); // Debug log
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
              uniqueKey: `${event._id}-${date.getTime()}`, // Generate unique key
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
      .filter(
        (event) =>
          new Date(event.startDate) > now &&
          new Date(event.startDate) <= endPeriod
      )
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time
  const formatTime = (timeString) => {
    const options = { hour: "2-digit", minute: "2-digit" };
    return new Date(timeString).toLocaleTimeString(undefined, options);
  };

  // Format the recurrence rule for display
  const formatRecurrenceRule = (rule) => {
    const rrule = RRule.fromString(rule);
    const freq = RRule.FREQUENCIES[rrule.options.freq];
    const interval = rrule.options.interval;
    const days = rrule.options.byweekday
      ? rrule.options.byweekday.map((day) => RRule.DAYS[day.weekday])
      : null;
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
    <div className="events-container">
      <h1 className="events-title">Upcoming Events</h1>
      <div className="view-toggle">
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
      <div className="events-grid">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event.uniqueKey} className="event-item">
              <div className="event-header">
                <h2 className="event-title">{event.title}</h2>
                <div className="event-date">{formatDate(event.startDate)}</div>
              </div>
              <div className="event-body">
                <div className="event-time">
                  {formatTime(event.startDate)} - {formatTime(event.endDate)}
                </div>
                {event.recurrenceRule && (
                  <div className="event-recurrence">
                    Recurs: {formatRecurrenceRule(event.recurrenceRule)}
                  </div>
                )}
                {event.details && (
                  <div className="event-details">{event.details}</div>
                )}
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
