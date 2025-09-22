import React, { useState } from "react";
import { signup } from "../services/auth";

/**
 * PUBLIC_INTERFACE
 * Signup
 * Register a new user and create a session using localStorage.
 */
export default function Signup({ onSuccess, goToLogin }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const strengthHint = "At least 8 characters, include letters and numbers.";

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const session = signup({ email, username, password });
      onSuccess?.(session);
    } catch (err) {
      setError(err?.message || "Sign up failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="brand">
          <span className="dot" />
          OceanTrip Planner
          <span className="badge">OSS</span>
        </div>
        <h2 style={{ margin: "6px 0 12px" }}>Create your account</h2>
        <form className="col" onSubmit={onSubmit} noValidate>
          <label className="col">
            <span className="muted">Email</span>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="col">
            <span className="muted">Username</span>
            <input
              className="input"
              placeholder="travel_enthusiast"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label className="col">
            <span className="muted">Password</span>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
            <small className="muted">{strengthHint}</small>
          </label>
          {error ? (
            <div className="card" style={{ borderColor: "var(--error)", color: "var(--error)" }}>
              {error}
            </div>
          ) : null}
          <button className="btn" type="submit" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>
        <div className="sep" />
        <div className="row" style={{ justifyContent: "center" }}>
          <span className="muted">Have an account?</span>
          <button className="btn btn-secondary" onClick={goToLogin} type="button">
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
