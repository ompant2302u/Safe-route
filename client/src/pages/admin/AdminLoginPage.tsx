import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  AdminApiError,
  getAdminToken,
  loginAdmin,
} from "../../services/adminService";

import "./Admin.css";

export default function AdminLoginPage() {
  const navigate =
    useNavigate();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  if (getAdminToken()) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    if (
      !email.trim() ||
      !password
    ) {
      setError(
        "Enter your email and password."
      );

      return;
    }

    setLoading(true);

    try {
      await loginAdmin(
        email.trim(),
        password
      );

      navigate(
        "/admin",
        {
          replace: true,
        }
      );
    } catch (loginError) {
      setError(
        loginError instanceof
          AdminApiError
          ? loginError.message
          : "Unable to login."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-icon">
          <ShieldCheck
            size={30}
          />
        </div>

        <span className="admin-eyebrow">
          SafeRoute Nepal
        </span>

        <h1>
          Admin Login
        </h1>

        <p>
          Sign in to review community
          hazard reports and manage
          verified safety information.
        </p>

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
        >
          <div className="admin-form-group">
            <label
              htmlFor="adminEmail"
            >
              Email
            </label>

            <input
              id="adminEmail"
              type="email"
              value={email}
              disabled={loading}
              placeholder="admin@example.com"
              onChange={(
                event
              ) =>
                setEmail(
                  event.target.value
                )
              }
            />
          </div>

          <div className="admin-form-group">
            <label
              htmlFor="adminPassword"
            >
              Password
            </label>

            <input
              id="adminPassword"
              type="password"
              value={password}
              disabled={loading}
              placeholder="Enter password"
              onChange={(
                event
              ) =>
                setPassword(
                  event.target.value
                )
              }
            />
          </div>

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            <LockKeyhole
              size={18}
            />

            {loading
              ? "Signing In..."
              : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}