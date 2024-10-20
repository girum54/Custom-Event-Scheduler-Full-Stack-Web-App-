//RRULE also called Recurrence Rule is a standard way to define how events or other entries repeat over time.
//Here it is imported to be used in the app

import { RRule } from "rrule";

//function to generate RRULE from form data entered
export const generateRRule = (eventData) => {
  const {
    startDateTime,
    recurrenceType,
    standardRecurrence,
    specificDates,
    specificInterval,
    relativeDate,
    relativeYearlyDate,
  } = eventData;
  const startDate = new Date(startDateTime);
  let options = {
    freq: RRule.DAILY,
  };
  //bysetpos used to locate relative weeks
  const getBysetpos = (week) => {
    switch (week) {
      case "first":
        return 1;
      case "second":
        return 2;
      case "third":
        return 3;
      case "fourth":
        return 4;
      case "fifth":
        return 5;
      case "last":
        return -1;
      default:
        return parseInt(week, 10); // Ensure it's a number
    }
  };

  //specific cases defined and specified for all required recurrences
  switch (recurrenceType) {
    case "single":
      return null;
    case "standard":
      switch (standardRecurrence) {
        case "daily":
          options.freq = RRule.DAILY;
          break;
        case "weekly":
          options.freq = RRule.WEEKLY;
          break;
        case "monthly":
          options.freq = RRule.MONTHLY;
          break;
        case "yearly":
          options.freq = RRule.YEARLY;
          break;
      }
      break;
    case "specific_dates":
      options.freq = RRule.WEEKLY;
      options.byweekday = specificDates.map(
        (day) => RRule[day.toUpperCase().slice(0, 2)]
      );
      break;
    case "specific_interval":
      switch (specificInterval.type) {
        case "daily":
          options.freq = RRule.DAILY;
          break;
        case "weekly":
          options.freq = RRule.WEEKLY;
          break;
        case "monthly":
          options.freq = RRule.MONTHLY;
          break;
        case "yearly":
          options.freq = RRule.YEARLY;
          break;
      }
      options.interval = specificInterval.number;
      break;
    case "relative_date":
      options.freq = RRule.MONTHLY;
      options.bysetpos = getBysetpos(relativeDate.week);
      if (relativeDate.day === "other") {
        options.byweekday =
          relativeDate.otherDay === "weekday"
            ? [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR]
            : [RRule.SA, RRule.SU];
      } else {
        options.byweekday = RRule[relativeDate.day.toUpperCase().slice(0, 2)];
      }
      break;
    case "relative_yearly_date":
      options.freq = RRule.YEARLY;
      options.bymonth = relativeYearlyDate.month;
      options.bysetpos = getBysetpos(relativeYearlyDate.week);
      if (relativeYearlyDate.day === "other") {
        options.byweekday =
          relativeYearlyDate.otherDay === "weekday"
            ? [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR]
            : [RRule.SA, RRule.SU];
      } else {
        options.byweekday =
          RRule[relativeYearlyDate.day.toUpperCase().slice(0, 2)];
      }
      break;
  }
  console.log(new RRule(options).toString()); //debug log
  return new RRule(options).toString();
};

//function used to set form data correctly based on RRULE
export const parseRRule = (rruleString) => {
  if (!rruleString) return { recurrenceType: "single" };

  const rrule = RRule.fromString(rruleString);
  const options = rrule.options;

  let parsedData = {};

  const getWeekString = (bysetpos) => {
    if (bysetpos === -1) return "last";
    return (
      ["first", "second", "third", "fourth", "fifth"][bysetpos - 1] || "first"
    );
  };

  const getDayString = (day) => {
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    return Array.isArray(day) ? day.map((d) => days[d]).join(", ") : days[day];
  };

  switch (options.freq) {
    case RRule.DAILY:
      parsedData = {
        recurrenceType: "standard",
        standardRecurrence: "daily",
      };
      break;
    case RRule.WEEKLY:
      if (
        options.byweekday &&
        Array.isArray(options.byweekday) &&
        options.byweekday.length > 0
      ) {
        parsedData = {
          recurrenceType: "specific_dates",
          specificDates: options.byweekday.map((day) => getDayString(day)),
        };
      } else {
        parsedData = {
          recurrenceType: "standard",
          standardRecurrence: "weekly",
        };
      }
      break;
    case RRule.MONTHLY:
      if (options.bysetpos) {
        parsedData = {
          recurrenceType: "relative_date",
          relativeDate: {
            week: getWeekString(options.bysetpos),
            day: getDayString(options.byweekday),
          },
        };
        if (Array.isArray(options.byweekday) && options.byweekday.length > 1) {
          parsedData.relativeDate.day = "other";
          parsedData.relativeDate.otherDay =
            options.byweekday.length === 5 ? "weekday" : "weekend";
        }
      } else {
        parsedData = {
          recurrenceType: "standard",
          standardRecurrence: "monthly",
        };
      }
      break;
    case RRule.YEARLY:
      if (options.bysetpos) {
        parsedData = {
          recurrenceType: "relative_yearly_date",
          relativeYearlyDate: {
            month: options.bymonth[0],
            week: getWeekString(options.bysetpos),
            day: getDayString(options.byweekday),
          },
        };
        if (Array.isArray(options.byweekday) && options.byweekday.length > 1) {
          parsedData.relativeYearlyDate.day = "other";
          parsedData.relativeYearlyDate.otherDay =
            options.byweekday.length === 5 ? "weekday" : "weekend";
        }
      } else {
        parsedData = {
          recurrenceType: "standard",
          standardRecurrence: "yearly",
        };
      }
      break;
  }

  if (options.interval && options.interval > 1) {
    parsedData.recurrenceType = "specific_interval";
    parsedData.specificInterval = {
      number: options.interval,
      type: parsedData.standardRecurrence,
    };
  }

  return parsedData;
};

//function used to generate human readable description for easy understanding of recurrence patters, also based on RRULE
export const generateHumanReadableDescription = (rruleString) => {
  if (!rruleString) return "Happens once on the specified date";

  let rrule;
  try {
    rrule = RRule.fromString(rruleString);
  } catch (error) {
    console.error("Invalid RRULE string:", error);
    return "Invalid recurrence rule";
  }

  const options = rrule.origOptions;

  let description = "Recurs ";

  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const getDayName = (day) => {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    if (Array.isArray(day)) {
      if (day.length === 5) return "weekday";
      if (day.length === 2 && day.includes(5) && day.includes(6))
        return "weekend day";
      return day.map((d) => days[d]).join(" and ");
    } else if (typeof day === "number") {
      return days[day];
    } else if (typeof day === "object" && day.weekday !== undefined) {
      return days[day.weekday];
    } else {
      return days[day];
    }
  };

  const getMonthName = (month) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    if (Array.isArray(month)) {
      return months[month[0] - 1] || "Unknown";
    }
    return months[month - 1] || "Unknown";
  };

  switch (options.freq) {
    case RRule.DAILY:
      description +=
        options.interval > 1 ? `every ${options.interval} days` : "daily";
      break;
    case RRule.WEEKLY:
      if (options.byweekday && options.byweekday.length > 0) {
        const days = options.byweekday.map((day) => getDayName(day));
        description += `on ${days.join(" and ")}`;
      } else {
        description +=
          options.interval > 1 ? `every ${options.interval} weeks` : "weekly";
      }
      break;
    case RRule.MONTHLY:
      if (options.bysetpos && options.byweekday) {
        const pos =
          options.bysetpos === -1 ? "last" : getOrdinal(options.bysetpos);
        const day =
          Array.isArray(options.byweekday) && options.byweekday.length > 0
            ? getDayName(options.byweekday[0])
            : "day";
        description += `on the ${pos} ${day} of the month`;
      } else {
        description +=
          options.interval > 1 ? `every ${options.interval} months` : "monthly";
      }
      break;
    case RRule.YEARLY:
      if (options.bymonth && options.bysetpos && options.byweekday) {
        const month = getMonthName(options.bymonth);
        const pos =
          options.bysetpos === -1 ? "last" : getOrdinal(options.bysetpos);
        const day =
          Array.isArray(options.byweekday) && options.byweekday.length > 0
            ? getDayName(options.byweekday[0])
            : "day";
        description += `on the ${pos} ${day} of ${month}`;
      } else {
        description +=
          options.interval > 1 ? `every ${options.interval} years` : "yearly";
      }
      break;
    default:
      description += "with an unknown frequency";
  }

  return description;
};

//functions used to convert ISO format dates into human readable format
export const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const formatTime = (timeString) => {
  const options = { hour: "2-digit", minute: "2-digit" };
  return new Date(timeString).toLocaleTimeString(undefined, options);
};
