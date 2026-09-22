/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Each token reads from a CSS variable holding "R G B" channels,
        // so Tailwind's opacity modifiers (e.g. bg-gold/5) keep working,
        // and the actual value flips instantly when the theme class changes
        // (see src/index.css for the light/dark variable definitions).
        bg: {
          DEFAULT: "rgb(var(--color-bg) / <alpha-value>)",
          secondary: "rgb(var(--color-bg-secondary) / <alpha-value>)",
        },
        card: "rgb(var(--color-card) / <alpha-value>)",
        input: "rgb(var(--color-input) / <alpha-value>)",
        gold: {
          DEFAULT: "rgb(var(--color-gold) / <alpha-value>)",
          bright: "rgb(var(--color-gold-bright) / <alpha-value>)",
        },
        heading: "rgb(var(--color-heading) / <alpha-value>)",
        body: "rgb(var(--color-body) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        // Fixed, theme-independent light text for CTA buttons — the new
        // primary accent is a deeper forest green (not a bright mint), so
        // light text is the correct, accessible contrast partner here in
        // both themes (this flips the previous dark-ink choice, which was
        // correct only for the old brighter mint accent).
        ink: "#F0F6F2",
        // Secondary accent references. accent-purple reuses the primary
        // accent (no purple is introduced anywhere). accent-blue now
        // points to its own dedicated navy variable — the reference
        // palette specifically calls for a distinguishable dark-blue
        // secondary accent, which can't be represented by reusing a green
        // variable, so this is the one new CSS variable this task adds.
        "accent-purple": "rgb(var(--color-gold) / <alpha-value>)",
        "accent-blue": "rgb(var(--color-accent-blue) / <alpha-value>)",
        // Third accent tier ("light accent" in the new palette) — used for
        // small highlights and as the text color on dark-surface buttons.
        "gold-light": "rgb(var(--color-gold-light) / <alpha-value>)",
        // Dark-surface button treatment ("normal" buttons: a dark green
        // surface with a mint text/border, distinct from the solid-mint
        // CTA buttons which use gold/gold-bright/ink above).
        button: {
          surface: "rgb(var(--color-button-surface) / <alpha-value>)",
          border: "rgb(var(--color-button-border) / <alpha-value>)",
          hover: "rgb(var(--color-button-hover) / <alpha-value>)",
        },
        // Error/warning accent — a soft muted pink/rose rather than a
        // stock bright red, per the new palette.
        error: "rgb(var(--color-error) / <alpha-value>)",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 0px rgba(61,138,92,0)" },
          "50%": { boxShadow: "0 0 24px rgba(61,138,92,0.15)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.7s ease-out forwards",
        "fade-in": "fadeIn 0.8s ease-out forwards",
        float: "float 5s ease-in-out infinite",
        blink: "blink 1s step-start infinite",
        glow: "glow 4s ease-in-out infinite",
        // Slow, elegant rotation for the hero photo's gradient ring —
        // reuses Tailwind's built-in `spin` keyframe at a much calmer
        // duration than the default animate-spin (1s).
        "spin-slow": "spin 6s linear infinite",
      },
    },
  },
  plugins: [],
};
