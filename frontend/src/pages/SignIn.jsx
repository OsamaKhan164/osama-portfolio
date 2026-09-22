import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, Loader2, AlertCircle , Code2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { api } from "../services/api.js";
import ThemeToggle from "../components/ThemeToggle.jsx";
// import Logo from "../components/Logo.jsx";

const fieldClasses = (hasError) =>
  `w-full rounded-md border bg-input px-4 py-3 text-sm text-heading placeholder:text-muted/60 transition-colors duration-200 focus:outline-none focus:ring-1 ${
    hasError
      ? "border-error/60 focus:border-error focus:ring-error/40"
      : "border-border focus:border-gold focus:ring-gold/40"
  }`;

export default function SignIn() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [formError, setFormError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!values.email.trim()) nextErrors.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!values.password) nextErrors.password = "Please enter your password.";
    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setStatus("loading");
    setFormError("");

    try {
      const { token: freshToken, user: freshUser } = await login(
        values.email.trim(),
        values.password
      );

      // Fire the welcome toast before navigating — the toast lives in a
      // Provider above the router Outlet, so it persists across the
      // navigate() below rather than being unmounted by the route change.
      showToast(`Welcome back, ${freshUser.name.split(" ")[0]}!`);

      // Smart redirect: resume whatever the visitor was trying to do.
      const from = location.state?.from || "/";
      const pendingAction = location.state?.pendingAction;

      if (pendingAction?.type === "external" && pendingAction.url) {
        window.open(pendingAction.url, "_blank", "noopener,noreferrer");

        if (pendingAction.action) {
          api
            .logActivity(
              { action: pendingAction.action, projectId: pendingAction.projectId, metadata: pendingAction.metadata },
              freshToken
            )
            .catch(() => {
              // Activity logging must never disrupt the actual user flow.
            });
        }
      }

      navigate(from, { replace: true });
    } catch (error) {
      setStatus("error");
      setFormError(error.message || "Sign in failed. Please try again.");
    }
  };

  return (
    <section className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      {/* <div className="absolute right-4 top-4">
        <ThemeToggle display="flex" />
      </div> */}
      <Link to="/" className="mx-auto mb-6 flex items-center gap-2">
        <Code2 />
      </Link>
      <div className="animate-fade-up rounded-lg border border-border bg-card p-6 sm:p-8">
        <p className="mb-2 font-mono text-sm tracking-wide text-gold">Welcome back</p>
        <h1 className="font-display text-2xl font-semibold text-heading sm:text-3xl">
          Sign In
        </h1>
        <p className="mt-2 text-sm text-muted">
          Sign in to view project details, source code, live demos and my resume.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-heading">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              placeholder="name@email.com"
              className={fieldClasses(errors.email)}
            />
            {errors.email && <p className="mt-1.5 text-xs text-error">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-heading">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={fieldClasses(errors.password)}
            />
            {errors.password && (
              <p className="mt-1.5 text-xs text-error">{errors.password}</p>
            )}
          </div>

          {status === "error" && (
            <div className="flex items-center gap-2 rounded-md border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
              <AlertCircle size={18} />
              {formError}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-ink transition-all duration-300 hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Signing in...
              </>
            ) : (
              <>
                <LogIn size={16} /> Sign In
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            state={location.state}
            className="font-medium text-gold transition-colors hover:text-gold-bright"
          >
            Sign up
          </Link>
        </p>
      </div>
    </section>
  );
}
