import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./Auth/Login";
import Signup from "./Auth/Signup";

import Home from "./Pages/Home/Home";
import Profile from "./Pages/Profile/Profile";

import Reels from "./Reels";
import Messages from "./Messages";
import Explore from "./Explore";

import "./App.css";

/* =========================================
   PROTECTED ROUTE
========================================= */

function ProtectedRoute({ children }) {
  const user =
    localStorage.getItem(
      "connectlyUser"
    );

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}

/* =========================================
   APP
========================================= */

function App() {
  const [loading, setLoading] =
    useState(true);

  /* =======================================
     LOADING SCREEN
  ======================================= */

  useEffect(() => {
    const timer =
      setTimeout(() => {
        setLoading(false);
      }, 1200);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  /* =======================================
     LOADING UI
  ======================================= */

  if (loading) {
    return (
      <div className="connectly-loader">

        <div className="loader-content">

          <div className="connectly-loader-logo">
            C<span>✦</span>
          </div>

          <h1>
            Connectly
          </h1>

          <p>
            Connect • Share • Explore
          </p>

          <div className="connectly-spinner"></div>

          <div className="connectly-loading-text">
            Loading
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </div>

        </div>

      </div>
    );
  }

  /* =======================================
     ROUTES
  ======================================= */

  return (
    <BrowserRouter>

      <Routes>

        {/* =================================
            LOGIN
        ================================= */}

        <Route
          path="/login"
          element={
            <Login />
          }
        />

        {/* =================================
            SIGNUP
        ================================= */}

        <Route
          path="/signup"
          element={
            <Signup />
          }
        />

        {/* =================================
            HOME
        ================================= */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* =================================
            PROFILE
        ================================= */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* =================================
            REELS
        ================================= */}

        <Route
          path="/reels"
          element={
            <ProtectedRoute>
              <Reels />
            </ProtectedRoute>
          }
        />

        {/* =================================
            MESSAGES
        ================================= */}

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />

        {/* =================================
            EXPLORE
        ================================= */}

        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <Explore />
            </ProtectedRoute>
          }
        />

        {/* =================================
            UNKNOWN URL
        ================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;