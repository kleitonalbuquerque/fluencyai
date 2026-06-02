# Future TODO: Calendar-Based Immersion Sessions

## Current Wave Status

Read-only lesson history is implemented in the sequential Immersion Plan flow:

- `GET /learning-plan/history` lists available lesson days for the user.
- `GET /learning-plan/history/day/{lesson_day}` returns saved lesson content and progress for review.
- Completed or past lessons remain readable after the user advances to the next lesson day.
- Reviewing historical content does not award duplicate XP, change streak, or create new progress rows.

The remaining future work in this document is only for a calendar-first model where every real date has its own learning session.

## Context

The current Immersion Plan works as a sequential learning track. The real calendar date is used for roadmap display only, while progress is controlled by `lesson_day`.

Example:

- April 28, 2026 can display the current roadmap card.
- The lesson content still comes from the user's `current_day`, such as lesson day 1, 2, or 3.
- If the user does not finish lesson day 1, the next day still shows lesson day 1 as the active lesson.
- If the user completes lesson day 1, the backend advances to lesson day 2.

This is acceptable for the MVP because users do not lose lesson content when they miss a calendar day.

## Future Goal

If the product needs a real calendar-based learning experience, introduce user learning sessions tied to calendar dates.

The product must also preserve learning history. Users should be able to return to completed content later, such as "Essential Phrases - Day 1", to review phrases, vocabulary, grammar, quiz answers, and speaking prompts.

## Proposed Model

Create a table similar to `daily_learning_sessions`:

- `id`
- `user_id`
- `calendar_date`
- `lesson_day`
- `status`: `pending`, `in_progress`, `completed`, `missed`
- `created_at`
- `updated_at`
- `completed_at`

Item and section progress could then reference a session instead of only `lesson_day`.

## Expected Behavior

- Future dates remain locked.
- Past dates with incomplete work remain accessible.
- Users can return to a previous calendar date and finish pending tasks.
- Completed lessons remain accessible for review.
- Completed section content remains readable even after the lesson advances.
- Reviewing old content must not duplicate XP or create new item progress rows.
- Historical progress should show the original completion state, answers, correctness, XP awarded, and completion timestamps.
- Skipping a day resets the day streak.
- Resetting the streak must not delete or hide unfinished session work.
- Completing an old pending session should update learning progress, but should not retroactively restore a broken streak unless explicitly designed.

## API Shape

Potential calendar-session endpoints:

- `GET /learning-plan/calendar?week_offset=0`
- `GET /learning-plan/sessions/{session_id}`
- `POST /learning-plan/sessions/{session_id}/items/{section}/{item_key}/complete`
- `POST /learning-plan/sessions/{session_id}/sections/{section}/complete`

The current history endpoints should remain available for read-only review even if calendar sessions are added later.

## Product Decision Needed

Before implementing, decide whether lesson progression should be:

- Sequential-first: calendar dates display where the user is in the track.
- Calendar-first: each date gets its own assigned session and missed days remain in history.

The current implementation is sequential-first.
