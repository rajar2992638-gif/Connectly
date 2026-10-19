import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    const name = formData.name.trim();
    const username = formData.username.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    /* ===============================
       VALIDATION
       =============================== */

    if (
      !name ||
      !username ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (username.length < 3) {
      setError(
        "Username must contain at least 3 characters."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      /* ===============================
         GET EXISTING USERS
         =============================== */

      const users =
        JSON.parse(
          localStorage.getItem("connectlyUsers")
        ) || [];

      /* ===============================
         CHECK USERNAME
         =============================== */

      const usernameExists = users.some(
        (user) =>
          user.username.toLowerCase() ===
          username.toLowerCase()
      );

      if (usernameExists) {
        setError("Username already exists.");
        setLoading(false);
        return;
      }

      /* ===============================
         CHECK EMAIL
         =============================== */

      const emailExists = users.some(
        (user) =>
          user.email.toLowerCase() === email
      );

      if (emailExists) {
        setError("Email is already registered.");
        setLoading(false);
        return;
      }

      /* ===============================
         CREATE NEW USER
         =============================== */

      const newUser = {
        id:
          typeof crypto !== "undefined" &&
          crypto.randomUUID
            ? crypto.randomUUID()
            : `user-${Date.now()}`,

        name,
        username,
        email,
        password,
        createdAt: new Date().toISOString(),
      };

      /* ===============================
         SAVE USER
         =============================== */

      users.push(newUser);

      localStorage.setItem(
        "connectlyUsers",
        JSON.stringify(users)
      );

      /* ===============================
         GO TO LOGIN
         =============================== */

      navigate("/login", {
        replace: true,
        state: {
          signupSuccess: true,
        },
      });

    } catch (error) {
      console.error("Signup failed:", error);

      setError(
        "Unable to create account. Please try again."
      );

      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card signup-card">

        {/* ===============================
            BRAND
           =============================== */}

        <div className="auth-brand">

          <div className="auth-logo">
            C✦
          </div>

          <h1>Connectly</h1>

          <p>Create your account</p>

        </div>

        {/* ===============================
            FORM
           =============================== */}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          {/* Error */}

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {/* Full Name */}

          <div className="form-group">

            <label htmlFor="name">
              Full Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              autoComplete="name"
            />

          </div>

          {/* Username */}

          <div className="form-group">

            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              autoComplete="username"
            />

          </div>

          {/* Email */}

          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
            />

          </div>

          {/* Password */}

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
              placeholder="Create a password"
              autoComplete="new-password"
            />

          </div>

          {/* Confirm Password */}

          <div className="form-group">

            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />

          </div>

          {/* Create Account */}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>

        </form>

        {/* ===============================
            DIVIDER
           =============================== */}

        <div className="auth-divider">
          <span>OR</span>
        </div>

        {/* ===============================
            LOGIN
           =============================== */}

        <p className="auth-switch">
          Already have an account?

          <Link to="/login">
            Log in
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Signup;