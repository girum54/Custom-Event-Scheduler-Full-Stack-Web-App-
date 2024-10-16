import { useState } from "react";
import "../styles/userAuth.css";

function UserAuth({ setIsLoggedIn }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          const data = await response.json();
          localStorage.setItem("token", data.token);
          setIsLoggedIn(true);
        } else {
          alert("Registration successful. Please log in.");
          setIsLogin(true);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error);
      }
    } catch (error) {
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
