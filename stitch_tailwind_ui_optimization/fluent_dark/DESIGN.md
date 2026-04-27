---
name: Fluent Dark
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f22'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#c6c5d5'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#908f9e'
  outline-variant: '#454653'
  surface-tint: '#bdc2ff'
  primary: '#bdc2ff'
  on-primary: '#131e8c'
  primary-container: '#818cf8'
  on-primary-container: '#101b8a'
  inverse-primary: '#4953bc'
  secondary: '#ddb8ff'
  on-secondary: '#490081'
  secondary-container: '#62259b'
  on-secondary-container: '#d1a1ff'
  tertiary: '#3cddc7'
  on-tertiary: '#003731'
  tertiary-container: '#00a896'
  on-tertiary-container: '#00352e'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e0e0ff'
  primary-fixed-dim: '#bdc2ff'
  on-primary-fixed: '#000767'
  on-primary-fixed-variant: '#2f3aa3'
  secondary-fixed: '#f0dbff'
  secondary-fixed-dim: '#ddb8ff'
  on-secondary-fixed: '#2c0051'
  on-secondary-fixed-variant: '#62259b'
  tertiary-fixed: '#62fae3'
  tertiary-fixed-dim: '#3cddc7'
  on-tertiary-fixed: '#00201c'
  on-tertiary-fixed-variant: '#005047'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  container-padding: 32px
  gutter: 24px
  card-gap: 16px
  section-margin: 48px
---

## Brand & Style

This design system is engineered for deep focus and high-performance learning. It targets a demographic of modern, tech-savvy learners who value a distraction-free environment that feels premium and sophisticated. 

The design style is **Modern Minimalism** with a focus on **Tonal Layering**. By utilizing a monochromatic deep-dark base punctuated by vibrant functional accents, the UI reduces cognitive load, allowing the educational content and progress metrics to take center stage. The aesthetic is professional yet motivating, evoking the feeling of a high-end productivity suite rather than a gamified toy.

## Colors

The palette is anchored by a "True Dark" foundation. The background uses a near-black neutral to maximize contrast for text and minimize eye strain during late-night study sessions. 

- **Primary (Indigo/Violet):** Extracted from the core brand elements, used for active states, primary actions, and progress highlights.
- **Secondary (Soft Purple):** Used for supplementary features and subtle gradients in achievement states.
- **Neutrals:** A range of deep charcoals and slate greys facilitate the "card-on-canvas" architecture. 
- **Functional Accents:** Success, warning, and error colors are desaturated to fit the dark theme while remaining accessible.

## Typography

This design system utilizes a dual-font strategy. **Manrope** is used for headlines to provide a modern, geometric character that feels premium. **Inter** is utilized for all body copy and UI labels due to its exceptional legibility at small sizes on digital screens.

Hierarchy is established through significant weight variance and the strategic use of uppercase tracking for "Overlines" or section labels (e.g., "DAILY PLAN"). Large headlines should always use tighter letter spacing to maintain a cohesive visual block.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid Grid**. On desktop, the content is contained within a 1280px max-width wrapper to maintain readability. The spacing rhythm is based on a 4px/8px incremental system.

- **Dashboard Grid:** A 12-column grid is used for the main dashboard. Cards typically span 4 columns for metrics and 6 or 12 columns for primary learning activities.
- **Visual Breath:** Generous section margins (48px+) ensure that the different areas of the dashboard (Statistics vs. Daily Lessons) feel distinct and organized.

## Elevation & Depth

This design system avoids traditional heavy shadows in favor of **Low-Contrast Outlines** and **Tonal Layering**. Depth is communicated through color value rather than simulated light sources.

1.  **Level 0 (Background):** Pure neutral black (`#09090B`).
2.  **Level 1 (Default Cards):** Deep charcoal (`#121217`) with a subtle 1px border in `white/10`.
3.  **Level 2 (Active/Hover):** Slightly lighter charcoal (`#18181B`) with a primary-tinted border (`indigo/30`).
4.  **Interaction:** Elements that are clickable should feel "inset" or "outset" purely through border-color shifts and subtle opacity changes.

## Shapes

The shape language is consistently **Rounded**. This softens the high-contrast dark theme, making the interface feel more approachable. 

- **Primary Cards:** Use a 12px-16px radius to create a containerized, "app-like" feel.
- **Buttons and Inputs:** Should match the card radius for a unified visual language. 
- **Progress Bars:** Fully rounded (pill-shaped) to represent fluidity and movement in the learning journey.

## Components

### Cards
Cards are the primary container. They must feature a subtle top-border or full-ring border in a muted grey/white at 10% opacity. For "Next Lesson" cards, use a primary-colored border to guide the user's eye.

### Buttons
- **Primary:** Solid Indigo background with white text. High-contrast.
- **Secondary:** Transparent background with a 1px white/20 border.
- **Ghost:** Minimal padding, subtle hover state (white/5 background).

### Progress Indicators
Utilize "Track and Fill" patterns. The track should be a dark neutral (`white/5`), while the fill utilizes a horizontal gradient from Primary to Secondary.

### Input Fields
Inputs are dark-themed with `white/5` background and a `white/20` border. On focus, the border transitions to the Primary Indigo color with a subtle outer glow (0px 0px 8px primary/20).

### Achievement Badges
Small, circular, or pill-shaped chips used for "Streak" and "XP" counts. Use a combination of a small icon and `label-caps` typography.