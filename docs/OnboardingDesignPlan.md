# Competitive Exam App Onboarding

## Professional Copy

### Screen 1
- Eyebrow: `Real Exam Simulation`
- Title: `Practice with a test experience that feels familiar on exam day.`
- Body: `Take full-length and topic-wise mock exams with timer pressure, clear sections, and a polished paper-like flow.`

### Screen 2
- Eyebrow: `Actionable Insights`
- Title: `See rank, accuracy, and speed in a way that tells you what to improve next.`
- Body: `Every attempt turns into a simple performance story with weak-topic flags, time trends, and confidence tracking.`

### Screen 3
- Eyebrow: `Daily Momentum`
- Title: `Build a consistent routine with practice streaks and revision nudges.`
- Body: `Short daily drills, personalised recommendations, and milestone rewards keep preparation focused and motivating.`

## Illustration Plan

### Screen 1
- A warm cream background with a floating exam card inside a device frame.
- Visual cues: timer chip, section label, answer options, full-test stat badge.
- Mood: calm pressure and readiness.

### Screen 2
- A results dashboard with chart bars, score card, and highlighted improvement metric.
- Visual cues: rank-quality analytics, accuracy emphasis, insight card.
- Mood: clear progress and direction.

### Screen 3
- A daily planner-style layout with streak value, practice plan, and reward tone.
- Visual cues: streak chip, study routine card, progress rhythm.
- Mood: consistency and motivation.

## Figma-Style Layout Structure

### Shared Frame
- Frame: `390 x 844`
- Background: `#FFF7F3`
- Top padding: `18`
- Horizontal padding: `24`
- Bottom padding: `26`

### Header
- Left group:
  - Rounded square brand mark `46 x 46`
  - App name
  - Subtitle `Exam Prep Companion`
- Right group:
  - Skip pill button on slides 1 and 2 only

### Hero Card
- White rounded container with `34` radius
- Inner padding `18`
- Border `1px #F5D9DB`
- Large soft shadow
- Eyebrow pill at top
- Central illustration region with one floating blob behind the device frame

### Copy Section
- Eyebrow label in uppercase brand red
- Large headline `30 / 38`
- Body copy `15 / 24`

### Footer
- Pagination dots centered
- Primary CTA full width, height `58`, radius `20`

## Visual Direction
- Primary brand color: `#C0203A`
- Accent gold: `#F4BC00`
- Success green: `#009E38`
- Base text: `#111827`
- Secondary text: `#5B6473`
- Surface: `#FFFFFF`
- Background: `#FFF7F3`

## Handoff Notes
- The current React Native implementation uses shape-based illustrations, so it previews well without extra assets.
- If you later want polished artwork, replace each illustration block with SVG or PNG artwork while keeping the same card and text structure.
