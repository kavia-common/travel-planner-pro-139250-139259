import React, { useState } from "react";
import { login } from "../services/auth";

/**
 * PUBLIC_INTERFACE
 * Login
 * Form to authenticate with email/username and password using localStorage.
 */
export default function Login({ onSuccess, goToSignup }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const session = login({ identifier, password });
      onSuccess?.(session);
    } catch (err) {
      setError(err?.message || "Login failed");
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
        <h2 style={{ margin: "6px 0 12px" }}>Welcome back</h2>
        <form className="col" onSubmit={onSubmit}>
          <label className="col">
            <span className="muted">Email or Username</span>
            <input
              className="input"
              placeholder="you@example.com or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
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
              required
            />
          </label>
          {error ? (
            <div className="card" style={{ borderColor: "var(--error)", color: "var(--error)" }}>
              {error}
            </div>
          ) : null}
          <button className="btn" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div className="sep" />
        <div className="row" style={{ justifyContent: "center" }}>
          <span className="muted">No account?</span>
          <button className="btn btn-secondary" onClick={goToSignup} type="button">
            Create one
          </button>
        </div>
      </div>
    </div>
  );
}
