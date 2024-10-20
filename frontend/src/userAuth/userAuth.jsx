import { useState } from "react";
import "../styles/userAuth.css";

function UserAuth({ setIsLoggedIn }) {
  //state to toggle between login and registration forms
  const [isLogin, setIsLogin] = useState(true);
  //state to store the username input
  const [username, setUsername] = useState("");
  //state to store the password input
  const [password, setPassword] = useState("");

  //Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Determine the endpoint based on whether the user is logging in or registering
    const endpoint = isLogin
      ? "http://localhost:5001/api/users/login"
      : "http://localhost:5001/api/users/register";
    const body = JSON.stringify({ username, password });
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
      });
      if (response.ok) {
        if (isLogin) {
          // If login is successful, store the token and update the login state
          const data = await response.json();
          localStorage.setItem("token", data.token);
          setIsLoggedIn(true);
        } else {
          // If registration is successful, prompt the user to log in
          alert("Registration successful. Please log in.");
          setIsLogin(true);
        }
      } else {
        // Handle errors from the server
        const errorData = await response.json();
        alert(errorData.error);
      }
    } catch (error) {
      // Handle network or other errors
      console.error("Authentication error:", error);
      alert("Authentication failed. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h2>{isLogin ? "Login" : "Register"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            type="text"
            className="form-control"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary">
          {isLogin ? "Login" : "Register"}
        </button>
      </form>
      <p className="toggle-message">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button className="btn-link" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Register" : "Login"}
        </button>
      </p>
    </div>
  );
}

export default UserAuth;
