import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Link,
} from "react-router-dom";
import "./App.css";
import UserAuth from "./userAuth/userAuth";
import EventForm from "./eventForm(add+Edit)/EventForm";
import UpcomingEvents from "./upcomingEventsList/upcomingEvents";
import ViewAllEvents from "./viewAllEventsCalendar/ViewAllEvents";
import SearchEvents from "./searchEvent/searchEvent";
import { AuthProvider, AuthContext } from "./userAuth/AuthContext";

const Navbar = ({ handleLogout }) => {
  const [isNavVisible, setNavVisible] = useState(false);

  const toggleNav = () => {
    setNavVisible(!isNavVisible);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <button className="nav-toggle" onClick={toggleNav}>
          ☰
        </button>
        <div className={`nav-links ${isNavVisible ? "show" : ""}`}>
          <Link to="/addevent" className="nav-link" onClick={toggleNav}>
            Add Event
          </Link>
          <Link to="/upcomingevents" className="nav-link" onClick={toggleNav}>
            Upcoming Events
          </Link>
          <Link to="/viewallevents" className="nav-link" onClick={toggleNav}>
            View All Events
          </Link>
          <Link to="/searchevents" className="nav-link" onClick={toggleNav}>
            Search Events
          </Link>
          <button className="nav-link btn-primary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

const AuthenticatedApp = () => {
  return (
    <div>
      <AuthContext.Consumer>
        {({ handleLogout }) => (
          <div>
            <Navbar handleLogout={handleLogout} />
            <div className="content">
              <Routes>
                <Route path="/addevent" element={<EventForm />} />
                <Route path="/editevent/:eventId" element={<EventForm />} />
                <Route path="/upcomingevents" element={<UpcomingEvents />} />
                <Route path="/viewallevents" element={<ViewAllEvents />} />
                <Route path="/searchevents" element={<SearchEvents />} />
                <Route path="*" element={<Navigate to="/upcomingevents" />} />
              </Routes>
            </div>
          </div>
        )}
      </AuthContext.Consumer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AuthContext.Consumer>
          {({ isLoggedIn, handleLogin }) =>
            isLoggedIn ? (
              <AuthenticatedApp />
            ) : (
              <UserAuth setIsLoggedIn={handleLogin} />
            )
          }
        </AuthContext.Consumer>
      </Router>
    </AuthProvider>
  );
}

export default App;
