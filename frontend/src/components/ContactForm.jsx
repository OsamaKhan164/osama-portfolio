import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";

const initialValues = { name: "", email: "", subject: "", message: "" };

function validate(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = "Please enter your name.";
  }

  if (!values.email.trim()) {
    errors.email = "Please enter your email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.subject.trim()) {
    errors.subject = "Please add a subject.";
  }

  if (!values.message.trim()) {
    errors.message = "Please write a short message.";
  } else if (values.message.trim().length < 10) {
    errors.message = "Message should be at least 10 characters.";
  }

  return errors;
}

const fieldClasses = (hasError) =>
  `w-full rounded-md border bg-input px-4 py-3 text-sm text-heading placeholder:text-muted/60 transition-colors duration-200 focus:outline-none focus:ring-1 ${
    hasError
      ? "border-error/60 focus:border-error focus:ring-error/40"
      : "border-border focus:border-gold focus:ring-gold/40"
  }`;

export default function ContactForm() {
  const { user, token } = useAuth();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState("");

  // Prefill name/email from the authenticated account — still editable,
  // since a visitor may reasonably want to sign a message differently.
  useEffect(() => {
    if (user) {
      setValues((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      await api.submitContact(
        {
          name: values.name.trim(),
          email: values.email.trim(),
          subject: values.subject.trim(),
          message: values.message.trim(),
        },
        token
      );
      setStatus("success");
      setValues({ ...initialValues, name: user?.name || "", email: user?.email || "" });
    } catch (error) {
      setStatus("error");
      setErrorMessage(error.message || "Something went wrong. Please try again.");
      if (error.fieldErrors) setErrors(error.fieldErrors);
    }
  };

  // Contact form is public — anyone can send a message, with or without
  // an account. If logged in, the submission is still associated with
  // that account server-side (see ContactForm's prefill effect above and
  // the backend's optionalAuth middleware).

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-heading">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={values.name}
            onChange={handleChange}
            placeholder="First Last"
            className={fieldClasses(errors.name)}
          />
          {errors.name && (
            <p className="mt-1.5 text-xs text-error">{errors.name}</p>
          )}
        </div>

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
          {errors.email && (
            <p className="mt-1.5 text-xs text-error">{errors.email}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="mb-2 block text-sm font-medium text-heading">
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          value={values.subject}
          onChange={handleChange}
          placeholder="What's this about?"
          className={fieldClasses(errors.subject)}
        />
        {errors.subject && (
          <p className="mt-1.5 text-xs text-error">{errors.subject}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium text-heading">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={values.message}
          onChange={handleChange}
          placeholder="How can I help?"
          className={`${fieldClasses(errors.message)} resize-none`}
        />
        {errors.message && (
          <p className="mt-1.5 text-xs text-error">{errors.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-ink transition-all duration-300 hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Sending...
          </>
        ) : (
          <>
            <Send size={16} /> Send Message
          </>
        )}
      </button>

      {status === "success" && (
        <div className="flex items-center gap-2 rounded-md border border-gold/30 bg-gold/5 px-4 py-3 text-sm text-gold animate-fade-in">
          <CheckCircle2 size={18} />
          Thanks for reaching out — I'll get back to you soon.
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 rounded-md border border-error/30 bg-error/5 px-4 py-3 text-sm text-error animate-fade-in">
          <AlertCircle size={18} />
          {errorMessage || "Something went wrong. Please try again in a moment."}
        </div>
      )}
    </form>
  );
}
