/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        "on-background": "var(--on-background)",
        "on-surface": "var(--on-surface)",
        "surface-container-low": "var(--surface-container-low)",
        primary: "var(--primary)",
        "on-primary": "var(--on-primary)",
        "primary-container": "var(--primary-container)",
        secondary: "var(--secondary)",
        "on-secondary": "var(--on-secondary)",
        tertiary: "var(--tertiary)",
        "on-tertiary": "var(--on-tertiary)",
        outline: "var(--outline)",
      },
      fontFamily: {
        manrope: ["var(--font-manrope)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
      },
      spacing: {
        base: "4px",
        "container-padding": "32px",
        gutter: "24px",
        "card-gap": "16px",
        "section-margin": "48px",
      },
    },
  },
  plugins: [],
}
