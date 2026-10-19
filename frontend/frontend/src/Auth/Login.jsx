import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const loginValue = formData.username.trim().toLowerCase();
    const password = formData.password;

    if (!loginValue || !password) {
      setError("Please enter username/email and password.");
      return;
    }

    setLoading(true);

    try {
      const savedUsers = localStorage.getItem("connectlyUsers");

      if (!savedUsers) {
        setError("No account found. Please create an account first.");
        setLoading(false);
        return;
      }

      const users = JSON.parse(savedUsers);

      if (!Array.isArray(users)) {
        setError("User data is corrupted. Please sign up again.");
        setLoading(false);
        return;
      }

      const user = users.find((item) => {
        const savedUsername = String(item.username || "")
          .trim()
          .toLowerCase();

        const savedEmail = String(item.email || "")
          .trim()
          .toLowerCase();

        const savedPassword = String(item.password || "");

        const usernameOrEmailMatch =
          savedUsername === loginValue ||
          savedEmail === loginValue;

        const passwordMatch =
          savedPassword === password;

        return usernameOrEmailMatch && passwordMatch;
      });

      if (!user) {
        setError("Invalid username/email or password.");
        setLoading(false);
        return;
      }

      const loggedInUser = {
        id: user.id || `user-${Date.now()}`,
        username: user.username || "",
        name: user.name || user.username || "User",
        email: user.email || "",
        avatar: (
          user.name ||
          user.username ||
          "U"
        )
          .charAt(0)
          .toUpperCase(),
      };

      localStorage.setItem(
        "connectlyUser",
        JSON.stringify(loggedInUser)
      );

      navigate(location.state?.from || "/", {
        replace: true,
      });

    } catch (error) {
      console.error("Login failed:", error);

      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-brand">
          <div className="auth-logo">
            C✦
          </div>

          <h1>Connectly</h1>

          <p>
            Connect • Share • Explore
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">
              Username or Email
            </label>

            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username or email"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <p className="auth-switch">
          Don't have an account?

          <Link to="/signup">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;