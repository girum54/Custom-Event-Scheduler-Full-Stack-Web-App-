import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "./App.css";
import UserAuth from "./userAuth/userAuth";
import AddEvent from "./addEvent/addEvent";
import UpcomingEvents from "./upcomingEventsList/upcomingEvents";
import { AuthProvider, AuthContext } from "./userAuth/AuthContext";

const AuthenticatedApp = () => (
  <div>
    <AuthContext.Consumer>
      {({ handleLogout }) => (
        <button className="btn-primary" onClick={handleLogout}>
          Logout
        </button>
      )}
    </AuthContext.Consumer>
    <Routes>
      <Route path="/addevent" element={<AddEvent />} />
      <Route path="/upcomingevents" element={<UpcomingEvents />} />
      <Route path="*" element={<Navigate to="/upcomingevents" />} />
    </Routes>
  </div>
);

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
