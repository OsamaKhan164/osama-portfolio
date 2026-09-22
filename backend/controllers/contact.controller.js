import Contact from "../models/Contact.js";
import logActivity from "../utils/logActivity.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LIMITS = {
  name: 100,
  email: 254,
  subject: 150,
  message: 5000,
};

// POST /api/contacts (public — guest or authenticated)
export async function createContact(req, res, next) {
  try {
    const { name, email, subject, message } = req.body || {};

    const trimmed = {
      name: typeof name === "string" ? name.trim() : "",
      email: typeof email === "string" ? email.trim().toLowerCase() : "",
      subject: typeof subject === "string" ? subject.trim() : "",
      message: typeof message === "string" ? message.trim() : "",
    };

    const errors = {};
    if (!trimmed.name) errors.name = "Name is required.";
    else if (trimmed.name.length > LIMITS.name) errors.name = "Name is too long.";

    if (!trimmed.email) errors.email = "Email is required.";
    else if (!EMAIL_RE.test(trimmed.email)) errors.email = "Please provide a valid email.";
    else if (trimmed.email.length > LIMITS.email) errors.email = "Email is too long.";

    if (!trimmed.subject) errors.subject = "Subject is required.";
    else if (trimmed.subject.length > LIMITS.subject) errors.subject = "Subject is too long.";

    if (!trimmed.message) errors.message = "Message is required.";
    else if (trimmed.message.length < 10) {
      errors.message = "Message should be at least 10 characters.";
    } else if (trimmed.message.length > LIMITS.message) {
      errors.message = "Message is too long.";
    }

    if (Object.keys(errors).length > 0) {
      res.status(400);
      return res.json({
        success: false,
        message: "Please fix the highlighted fields.",
        errors,
      });
    }

    // req.user is only set when optionalAuth found a valid token — never
    // trust a client-supplied userId (none is ever accepted from the body).
    // Guests submit with `user: null`.
    const contact = await Contact.create({
      user: req.user?._id || null,
      name: trimmed.name,
      email: trimmed.email,
      subject: trimmed.subject,
      message: trimmed.message,
    });

    // Activity tracking is specifically for authenticated user activity
    // (Activity.user is required) — guest submissions simply aren't logged.
    if (req.user) {
      // Only the contact record's own id is referenced — never the message
      // content itself, to avoid duplicating potentially sensitive text.
      logActivity({
        userId: req.user._id,
        action: "CONTACT_SUBMIT",
        metadata: { contactId: contact._id.toString() },
      });
    }

    res.status(201).json({
      success: true,
      message: "Your message has been sent successfully.",
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        message: contact.message,
        status: contact.status,
        createdAt: contact.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}
