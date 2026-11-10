import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Lock, Mail, User } from "lucide-react";

import { useAuth } from "../context/useAuth";
import "./AuthPages.css";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(username.trim(), email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-brand">
          <span className="auth-brand-icon">
            <GraduationCap size={26} />
          </span>
          <span>
            <strong>VertexLearn</strong>
            <small>AI LEARNING PLATFORM</small>
          </span>
        </Link>

        <div className="auth-heading">
          <h1>Create your account</h1>
          <p>Start learning with your personal AI companion.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="register-username">Username</label>
          <div className="auth-input">
            <User size={18} />
            <input
              id="register-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Choose a username"
              autoComplete="username"
              required
            />
          </div>

          <label htmlFor="register-email">Email address</label>
          <div className="auth-input">
            <Mail size={18} />
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          <label htmlFor="register-password">Password</label>
          <div className="auth-input">
            <Lock size={18} />
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
