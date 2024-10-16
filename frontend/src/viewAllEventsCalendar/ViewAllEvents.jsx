import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { RRule, rrulestr } from "rrule";
import "../styles/viewAllEvents.css"; // Importing the CSS file

function ViewAllEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5001/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const now = new Date();
        const endPeriod = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // Limit to one year

        const processedEvents = data.flatMap((event) => {
          if (event.recurrenceRule && event.recurrenceRule !== "null") {
            try {
              const rule = rrulestr(event.recurrenceRule);
              const occurrences = rule.between(now, endPeriod);
              return occurrences.map((date) => ({
                title: event.title,
                start: date.toISOString(),
                end: new Date(
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
          return [
            {
              title: event.title,
              start: event.startDate,
              end: event.endDate,
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
  };

  return (
    <div className="calendar-container">
      <h2 className="calendar-title">All Events</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
      />
    </div>
  );
}

export default ViewAllEvents;
