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
import AddEvent from "./addEvent/addEvent";
import UpcomingEvents from "./upcomingEventsList/upcomingEvents";
import ViewAllEvents from "./viewAllEventsCalendar/ViewAllEvents";
import EditEvent from "./editEvent/editEvent"; // Import EditEvent component
import { AuthProvider, AuthContext } from "./userAuth/AuthContext";

const AuthenticatedApp = () => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  return (
    <div>
      <AuthContext.Consumer>
        {({ handleLogout }) => (
          <div>
            <nav className="navbar">
              <button
                className="btn-primary nav-toggle"
                onClick={handleNavCollapse}
              >
                ☰
              </button>
              <div className={`${isNavCollapsed ? "collapse" : ""} nav-links`}>
                <Link to="/addevent" className="nav-link btn-primary">
                  Add Event
                </Link>
                <Link to="/upcomingevents" className="nav-link btn-primary">
                  Upcoming Events
                </Link>
                <Link to="/viewallevents" className="nav-link btn-primary">
                  View All Events
                </Link>
                <button className="nav-link btn-primary" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </nav>
            <Routes>
              <Route path="/addevent" element={<AddEvent />} />
              <Route path="/upcomingevents" element={<UpcomingEvents />} />
              <Route path="/viewallevents" element={<ViewAllEvents />} />
              <Route path="/editevent/:eventId" element={<EditEvent />} />
              <Route path="*" element={<Navigate to="/upcomingevents" />} />
            </Routes>
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
