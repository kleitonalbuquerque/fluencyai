"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type {
  CompleteLessonSectionResult,
  DailyImmersionPlanWithProgress,
  ImmersionSectionKey,
  LessonHistoryEntry,
  LearningSectionStatus,
  WeeklyRoadmapDay,
} from "../domain/types";
import {
  START_LESSON_EVENT,
  START_LESSON_STORAGE_KEY,
} from "../domain/immersionStart";
import {
  useCompleteImmersionItem,
  useCompleteImmersionSection,
  useImmersionPlanHistory,
  useLearningTracks,
  useSetActiveLearningTrack,
  useUncompleteImmersionItem,
  useWeeklyImmersionPlan,
} from "../hooks/useProductFeatures";
import {
  getImmersionPlanDay,
  getImmersionPlanHistoryDay,
} from "../services/productApi";
import { FeatureState } from "./FeatureState";

const SECTION_ORDER: ImmersionSectionKey[] = [
  "phrases",
  "vocabulary",
  "grammar",
  "grammar_practice",
  "speaking",
  "quiz",
];

const SECTION_CONFIG: Record<
  ImmersionSectionKey,
  {
    title: string;
    icon: string;
    actionLabel: string;
    completedActionLabel: string;
    description: (plan: DailyImmersionPlanWithProgress) => string;
  }
> = {
  phrases: {
    title: "Essential Phrases",
    icon: "record_voice_over",
    actionLabel: "Review list",
    completedActionLabel: "Review list",
    description: (plan) => `${plan.essential_phrases.length} phrases for daily fluency.`,
  },
  vocabulary: {
    title: "Thematic Vocabulary",
    icon: "menu_book",
    actionLabel: "Review list",
    completedActionLabel: "Review list",
    description: (plan) => {
      const theme = plan.vocabulary_words[0]?.theme ?? "Daily English";
      return `Theme: ${theme}.`;
    },
  },
  grammar: {
    title: "Grammar Points",
    icon: "rule",
    actionLabel: "Resume Study",
    completedActionLabel: "Review Grammar",
    description: (plan) => plan.grammar_points[0]?.title ?? "Grammar review.",
  },
  grammar_practice: {
    title: "Verb & Structure Practice",
    icon: "edit_note",
    actionLabel: "Practice",
    completedActionLabel: "Review Practice",
    description: (plan) => `${plan.grammar_practice_items.length} verb and structure drills.`,
  },
  speaking: {
    title: "Speaking Exercise",
    icon: "mic",
    actionLabel: "Begin Practice",
    completedActionLabel: "Review Prompt",
    description: (plan) => trimText(plan.speaking_exercise, 72),
  },
  quiz: {
    title: "Final Quiz",
    icon: "quiz",
    actionLabel: "Take Final Exam",
    completedActionLabel: "Review Quiz",
    description: (plan) => plan.quiz.title,
  },
};

export function ImmersionPlanPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const weeklyPlan = useWeeklyImmersionPlan(weekOffset);
  const history = useImmersionPlanHistory();
  const tracks = useLearningTracks();
  const trackSelection = useSetActiveLearningTrack();
  const completion = useCompleteImmersionSection();
  const itemCompletion = useCompleteImmersionItem();
  const itemUndo = useUncompleteImmersionItem();
  const [activePlan, setActivePlan] = useState<DailyImmersionPlanWithProgress | null>(null);
  const [activeSection, setActiveSection] = useState<ImmersionSectionKey | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loadingDay, setLoadingDay] = useState<number | null>(null);
  const [loadingHistoryDay, setLoadingHistoryDay] = useState<number | null>(null);
  const previousWeekOffset = useRef<number | null>(null);

  useEffect(() => {
    if (!weeklyPlan.data) {
      return;
    }

    const data = weeklyPlan.data;
    const weekChanged =
      previousWeekOffset.current !== null &&
      previousWeekOffset.current !== data.week_offset;
    previousWeekOffset.current = data.week_offset;
    const weekDays = new Set(data.days.map((day) => day.day));

    setActivePlan((currentPlan) => {
      if (weekChanged || !currentPlan || !weekDays.has(currentPlan.day)) {
        return data.focus;
      }

      if (!activeSection && currentPlan.day === data.focus.day) {
        return data.focus;
      }

      return currentPlan;
    });

    if (weekChanged) {
      setActiveSection(null);
    }

    setDetailError(null);
  }, [activeSection, weeklyPlan.data]);

  const sectionStatuses = useMemo(() => {
    return new Map(activePlan?.sections.map((section) => [section.section, section]) ?? []);
  }, [activePlan]);

  const activeRoadmapDay = weeklyPlan.data?.days.find(
    (day) => day.day === activePlan?.day,
  );
  const isActiveDayLocked = activeRoadmapDay?.is_locked ?? false;
  const isReviewOnly =
    Boolean(activePlan && weeklyPlan.data && activePlan.day < weeklyPlan.data.current_day);
  const selectedSectionStatus = activeSection
    ? sectionStatuses.get(activeSection) ?? null
    : null;

  function openNextLessonSection() {
    if (!activePlan || isActiveDayLocked || isReviewOnly) {
      return false;
    }

    const nextSection = SECTION_ORDER.find(
      (section) => !sectionStatuses.get(section)?.is_completed,
    );
    if (!nextSection) {
      return false;
    }

    setActiveSection(nextSection);
    return true;
  }

  useEffect(() => {
    function startLesson() {
      if (
        window.sessionStorage.getItem(START_LESSON_STORAGE_KEY) === "1" &&
        openNextLessonSection()
      ) {
        window.sessionStorage.removeItem(START_LESSON_STORAGE_KEY);
      }
    }

    startLesson();
    window.addEventListener(START_LESSON_EVENT, startLesson);

    return () => window.removeEventListener(START_LESSON_EVENT, startLesson);
  }, [activePlan, isActiveDayLocked, isReviewOnly, sectionStatuses]);

  async function selectRoadmapDay(day: WeeklyRoadmapDay) {
    if (day.is_locked || !weeklyPlan.session) {
      return;
    }

    setLoadingDay(day.day);
    setDetailError(null);
    setSuccessMessage(null);
    try {
      const plan = await getImmersionPlanDay(weeklyPlan.session.accessToken, day.day);
      setActivePlan(plan);
      setActiveSection(null);
    } catch (cause) {
      setDetailError(cause instanceof Error ? cause.message : "Could not load day content.");
    } finally {
      setLoadingDay(null);
    }
  }

  async function selectHistoryDay(entry: LessonHistoryEntry) {
    if (!history.session) {
      return;
    }

    setLoadingHistoryDay(entry.day);
    setDetailError(null);
    setSuccessMessage(null);
    try {
      const plan = await getImmersionPlanHistoryDay(history.session.accessToken, entry.day);
      setActivePlan(plan);
      setActiveSection(null);
    } catch (cause) {
      setDetailError(cause instanceof Error ? cause.message : "Could not load lesson history.");
    } finally {
      setLoadingHistoryDay(null);
    }
  }

  async function selectTrack(trackSlug: string) {
    if (trackSlug === weeklyPlan.data?.track.slug) {
      return;
    }

    setDetailError(null);
    setSuccessMessage(null);
    const didSwitch = await trackSelection.select(trackSlug);
    if (!didSwitch) {
      return;
    }

    setWeekOffset(0);
    setActiveSection(null);
    setActivePlan(null);
    await weeklyPlan.mutate();
    await history.mutate();
  }

  async function completeSection(section: ImmersionSectionKey) {
    if (!activePlan || isActiveDayLocked || isReviewOnly) {
      return;
    }

    setDetailError(null);
    setSuccessMessage(null);
    const result = await completion.complete(activePlan.day, section);
    if (!result || !completion.session) {
      return;
    }

    setActiveSection(null);
    setSuccessMessage(buildSectionSuccessMessage(section, result));
    setActivePlan((currentPlan) => (
      currentPlan?.day === result.day
        ? applySectionCompletionResult(currentPlan, result)
        : currentPlan
    ));
    weeklyPlan.mutate();
    history.mutate();

    try {
      const updatedPlan = await getImmersionPlanDay(
        completion.session.accessToken,
        activePlan.day,
      );
      setActivePlan(updatedPlan);
    } catch (cause) {
      setDetailError(cause instanceof Error ? cause.message : "Saved, but could not refresh progress.");
    }
  }

  async function completeItem(
    section: ImmersionSectionKey,
    itemKey: string,
    answer?: string,
  ) {
    if (!activePlan || isActiveDayLocked || isReviewOnly) {
      return;
    }

    setSuccessMessage(null);
    const result = await itemCompletion.complete(
      activePlan.day,
      section,
      itemKey,
      answer,
    );
    if (result) {
      setActivePlan(result.plan);
    }
  }

  async function uncompleteItem(section: ImmersionSectionKey, itemKey: string) {
    if (!activePlan || isActiveDayLocked || isReviewOnly) {
      return;
    }

    setSuccessMessage(null);
    const result = await itemUndo.uncomplete(activePlan.day, section, itemKey);
    if (result) {
      setActivePlan(result.plan);
    }
  }

  async function continueLesson() {
    if (openNextLessonSection()) {
      return;
    }

    if (!activePlan || !weeklyPlan.data || !weeklyPlan.session) {
      return;
    }

    const nextAvailableDay = weeklyPlan.data.days.find(
      (day) => day.day > activePlan.day && !day.is_locked && day.has_lesson,
    );
    if (!nextAvailableDay) {
      setSuccessMessage("Parabéns! Esta lição já está 100% concluída.");
      return;
    }

    await selectRoadmapDay(nextAvailableDay);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 md:px-8 md:py-12">
      <FeatureState
        error={weeklyPlan.error}
        isLoading={weeklyPlan.isLoading && !weeklyPlan.data}
      />

      {weeklyPlan.data && activePlan ? (
        <>
          <section className="mb-12">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="mb-2 text-[32px] font-bold text-on-surface">Weekly Roadmap</h2>
                <p className="text-lg text-on-surface/70">
                  Your personalized path to fluency for{" "}
                  {formatDateRange(
                    weeklyPlan.data.week_start_date,
                    weeklyPlan.data.week_end_date,
                  )}.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-on-surface/55">
                    Track
                  </span>
                  {tracks.data?.map((track) => (
                    <button
                      className={`rounded-full border px-3 py-1 text-sm font-bold transition-colors ${
                        weeklyPlan.data?.track.slug === track.slug
                          ? "border-primary bg-primary text-on-primary"
                          : "border-outline/20 bg-surface-container-low text-on-surface/70 hover:border-primary/50 hover:text-primary"
                      }`}
                      disabled={trackSelection.isPending}
                      key={track.slug}
                      onClick={() => selectTrack(track.slug)}
                      type="button"
                    >
                      {track.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 self-start rounded-xl border border-outline/15 bg-surface-container-low p-1">
                <button
                  className="rounded-lg px-4 py-2 text-[12px] font-bold uppercase tracking-[0.1em] text-on-surface/55 transition-colors hover:bg-primary/10 hover:text-primary"
                  onClick={() => setWeekOffset((current) => current - 1)}
                  type="button"
                >
                  Previous
                </button>
                <button
                  className="rounded-lg border border-primary/30 bg-primary/20 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-primary/30"
                  onClick={() => setWeekOffset(0)}
                  type="button"
                >
                  Current Week
                </button>
                <button
                  className="rounded-lg px-4 py-2 text-[12px] font-bold uppercase tracking-[0.1em] text-on-surface/55 transition-colors hover:bg-primary/10 hover:text-primary"
                  onClick={() => setWeekOffset((current) => current + 1)}
                  type="button"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-7">
              {weeklyPlan.data.days.map((day) => (
                <RoadmapDayCard
                  day={day}
                  isSelected={activePlan.day === day.day}
                  isLoading={loadingDay === day.day}
                  key={`${day.calendar_date}-${day.day}`}
                  onSelect={() => selectRoadmapDay(day)}
                  trackLabel={activePlan.track_label}
                />
              ))}
            </div>
          </section>

          {(detailError || trackSelection.error || completion.error || itemCompletion.error || itemUndo.error) && (
            <div className="mb-6 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm font-semibold text-error">
              {detailError ?? trackSelection.error ?? completion.error ?? itemCompletion.error ?? itemUndo.error}
            </div>
          )}

          {successMessage ? (
            <div
              className="mb-6 flex items-start gap-3 rounded-xl border border-tertiary/30 bg-tertiary/10 px-4 py-3 text-sm text-tertiary"
              role="status"
            >
              <span className="material-symbols-outlined text-xl">check_circle</span>
              <p className="flex-1 font-bold">{successMessage}</p>
              <button
                aria-label="Dismiss success message"
                className="rounded-full p-1 text-tertiary transition-colors hover:bg-tertiary/10"
                onClick={() => setSuccessMessage(null)}
                type="button"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          ) : null}

          {history.data?.entries.length ? (
            <LessonHistoryPanel
              activeDay={activePlan.day}
              entries={history.data.entries}
              loadingDay={loadingHistoryDay}
              onSelect={selectHistoryDay}
            />
          ) : null}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <section className="flex flex-col justify-between rounded-2xl border border-outline/15 bg-surface-container-high p-8 md:col-span-4">
              <div>
                <h3 className="mb-2 text-[24px] font-bold text-on-surface">
                  {isReviewOnly
                    ? `Day ${activePlan.day} Review`
                    : activePlan.day === weeklyPlan.data.current_day
                    ? "Today's Focus"
                    : `Day ${activePlan.day} Focus`}
                </h3>
                <p className="mb-6 text-lg text-on-surface/70">{activePlan.title}</p>
                <p className="-mt-4 mb-6 text-sm font-bold uppercase tracking-[0.1em] text-primary">
                  {activePlan.track_label} track
                </p>
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-[12px] font-bold uppercase tracking-[0.1em] text-on-surface/55">
                      <span>Daily Progress</span>
                      <span>{activePlan.progress_percent}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-outline/20">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all"
                        style={{ width: `${activePlan.progress_percent}%` }}
                      />
                    </div>
                  </div>

                  <ul className="space-y-4">
                    {SECTION_ORDER.map((section) => {
                      const status = sectionStatuses.get(section);
                      const isCompleted = status?.is_completed ?? false;
                      return (
                        <li
                          className={`flex items-center gap-3 ${
                            isCompleted ? "text-tertiary" : "text-on-surface/60"
                          }`}
                          key={section}
                        >
                          <span className="material-symbols-outlined text-xl">
                            {isCompleted ? "check_circle" : "radio_button_unchecked"}
                          </span>
                          <span className="text-lg">
                            {status?.label ?? SECTION_CONFIG[section].title}
                            {!isCompleted && status ? ` (${status.item_count} left)` : ""}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
              <button
                className="mt-8 w-full rounded-xl bg-primary py-4 font-bold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isActiveDayLocked || isReviewOnly}
                onClick={continueLesson}
                type="button"
              >
                {isReviewOnly
                  ? "Review Mode"
                  : activePlan.progress_percent === 100
                    ? "Review Completed Lesson"
                    : "Continue Lesson"}
              </button>
            </section>

            <section className="grid grid-cols-1 gap-6 md:col-span-8 sm:grid-cols-2">
              {SECTION_ORDER.map((section) => (
                <LearningSectionCard
                  key={section}
                  plan={activePlan}
                  section={section}
                  status={sectionStatuses.get(section)}
                  onOpen={() => setActiveSection(section)}
                />
              ))}
            </section>
          </div>

          {activeSection && selectedSectionStatus ? (
            <SectionDetailDialog
              isCompleting={completion.isPending}
              isCompletingItem={itemCompletion.isPending || itemUndo.isPending}
              isLocked={isActiveDayLocked || isReviewOnly}
              isReviewOnly={isReviewOnly}
              onClose={() => setActiveSection(null)}
              onComplete={() => completeSection(activeSection)}
              onCompleteItem={completeItem}
              onUncompleteItem={uncompleteItem}
              plan={activePlan}
              section={activeSection}
              status={selectedSectionStatus}
            />
          ) : null}
        </>
      ) : null}
    </main>
  );
}

function RoadmapDayCard({
  day,
  isSelected,
  isLoading,
  onSelect,
  trackLabel,
}: {
  day: WeeklyRoadmapDay;
  isSelected: boolean;
  isLoading: boolean;
  onSelect: () => void;
  trackLabel: string;
}) {
  const progressPercent = Math.max(0, Math.min(100, day.progress_percent));
  const isComplete = day.is_completed || progressPercent === 100;
  const hasPartialProgress = progressPercent > 0 && !isComplete;
  const stateIcon = isLoading
    ? "progress_activity"
    : isComplete
      ? "check_circle"
      : day.is_current
        ? "play_arrow"
        : day.is_locked
          ? "lock"
          : hasPartialProgress
            ? "pending"
            : "radio_button_unchecked";
  const stateClass = day.is_current
    ? "border-indigo-400 bg-indigo-900/20 shadow-[0_0_20px_rgba(129,140,248,0.15)]"
    : isComplete
      ? "border-tertiary/40 bg-tertiary/10"
      : hasPartialProgress
        ? "border-primary/35 bg-primary/10"
      : "border-outline/15 bg-surface-container-lowest";
  const progressTone = isComplete
    ? "bg-tertiary"
    : hasPartialProgress || day.is_current
      ? "bg-primary"
      : "bg-outline/30";
  const progressLabel = isComplete ? "Complete" : `${progressPercent}%`;

  return (
    <button
      aria-label={`${trackLabel}, ${day.weekday_label} ${day.calendar_day}, ${progressPercent}% complete`}
      className={`relative flex min-h-[148px] flex-col items-center gap-3 rounded-2xl border p-5 transition-all ${
        stateClass
      } ${isSelected ? "ring-2 ring-primary/60" : ""} ${
        day.is_locked ? "cursor-not-allowed opacity-55" : "hover:-translate-y-0.5 hover:border-primary/40"
      }`}
      disabled={day.is_locked || isLoading}
      onClick={onSelect}
      type="button"
    >
      {day.is_current ? (
        <span className="absolute -top-3 rounded-full bg-indigo-400 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-on-primary">
          Today
        </span>
      ) : null}
      <span
        className={`absolute right-3 top-3 flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
          isComplete
            ? "bg-tertiary text-on-tertiary"
            : hasPartialProgress
              ? "bg-primary text-on-primary"
              : "border border-outline/20 text-on-surface/45"
        }`}
      >
        {isComplete ? (
          <span className="material-symbols-outlined text-[16px]">check</span>
        ) : hasPartialProgress ? (
          progressPercent
        ) : (
          "0"
        )}
      </span>
      <span
        className={`text-[12px] font-bold uppercase tracking-[0.1em] ${
          day.is_current || hasPartialProgress || isComplete ? "text-primary" : "text-on-surface/45"
        }`}
      >
        {day.weekday_label}
      </span>
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-full ${
          isComplete
            ? "border border-tertiary/40 bg-tertiary/15 text-tertiary"
            : day.is_current
            ? "bg-indigo-400 text-on-primary"
            : hasPartialProgress
              ? "border border-primary/40 bg-primary/15 text-primary"
              : "border border-outline/15 bg-surface-container-low text-on-surface/45"
        }`}
      >
        <span className="material-symbols-outlined">
          {stateIcon}
        </span>
      </span>
      <span className="text-[24px] font-bold text-on-surface">{day.calendar_day}</span>
      <span className="w-full rounded-full bg-outline/10">
        <span
          aria-hidden="true"
          className={`block h-1.5 rounded-full ${progressTone}`}
          style={{ width: `${progressPercent}%` }}
        />
      </span>
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-on-surface/60">
        {progressLabel}
      </span>
    </button>
  );
}

function LearningSectionCard({
  plan,
  section,
  status,
  onOpen,
}: {
  plan: DailyImmersionPlanWithProgress;
  section: ImmersionSectionKey;
  status?: LearningSectionStatus;
  onOpen: () => void;
}) {
  const config = SECTION_CONFIG[section];
  const isCompleted = status?.is_completed ?? false;
  const isQuiz = section === "quiz";

  return (
    <article
      className={`rounded-2xl border border-outline/15 bg-surface-container p-6 ${
        isQuiz ? "sm:col-span-2" : ""
      } ${isCompleted ? "border-l-4 border-l-tertiary" : "border-l-4 border-l-primary/60"}`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div
          className={`rounded-lg p-2 ${
            isCompleted ? "bg-tertiary/10 text-tertiary" : "bg-primary/10 text-primary"
          }`}
        >
          <span className="material-symbols-outlined">{config.icon}</span>
        </div>
        <span
          className={`text-[12px] font-bold uppercase tracking-[0.1em] ${
            isCompleted ? "text-tertiary" : "text-on-surface/55"
          }`}
        >
          {isCompleted ? "Completed" : "Incomplete"}
        </span>
      </div>
      <h4 className="mb-1 text-[24px] font-bold text-on-surface">
        {section === "phrases"
          ? `${plan.essential_phrases.length} Phrases`
          : section === "vocabulary"
            ? `${plan.vocabulary_words.length} Words`
            : section === "grammar_practice"
              ? `${plan.grammar_practice_items.length} Practice Drills`
            : section === "quiz"
              ? `Day ${plan.day} Final Quiz`
              : config.title}
      </h4>
      <p className="mb-4 min-h-[54px] text-lg text-on-surface/65">
        {config.description(plan)}
      </p>
      <button
        className={`inline-flex items-center gap-1 rounded-lg text-sm font-bold transition-colors ${
          isCompleted
            ? "text-tertiary hover:text-tertiary/80"
            : "bg-primary/20 px-4 py-2 text-primary hover:bg-primary/30"
        }`}
        onClick={onOpen}
        type="button"
      >
        {isCompleted ? config.completedActionLabel : config.actionLabel}
        <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
    </article>
  );
}

function LessonHistoryPanel({
  activeDay,
  entries,
  loadingDay,
  onSelect,
}: {
  activeDay: number;
  entries: LessonHistoryEntry[];
  loadingDay: number | null;
  onSelect: (entry: LessonHistoryEntry) => void;
}) {
  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-[20px] font-bold text-on-surface">Lesson History</h3>
          <p className="mt-1 text-sm text-on-surface/60">
            Review completed and unlocked lessons without changing XP or streak.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {entries.map((entry) => (
          <button
            aria-label={`Day ${entry.day} ${entry.title}`}
            className={`rounded-xl border p-4 text-left transition-colors ${
              activeDay === entry.day
                ? "border-primary/60 bg-primary/10"
                : "border-outline/15 bg-surface-container hover:border-primary/40 hover:bg-primary/5"
            }`}
            disabled={loadingDay === entry.day}
            key={entry.day}
            onClick={() => onSelect(entry)}
            type="button"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-primary">
                Day {entry.day}
              </span>
              <span
                className={`material-symbols-outlined text-lg ${
                  entry.is_completed ? "text-tertiary" : "text-on-surface/55"
                }`}
              >
                {loadingDay === entry.day
                  ? "progress_activity"
                  : entry.is_completed
                    ? "check_circle"
                    : "radio_button_unchecked"}
              </span>
            </div>
            <p className="font-bold text-on-surface">{entry.title}</p>
            <div className="mt-4 flex items-center justify-between text-xs font-bold uppercase tracking-[0.1em] text-on-surface/55">
              <span>{entry.is_current ? "Current" : entry.is_completed ? "Completed" : "In progress"}</span>
              <span>{entry.progress_percent}%</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function SectionDetailDialog({
  isCompleting,
  isCompletingItem,
  isLocked,
  isReviewOnly,
  onClose,
  onComplete,
  onCompleteItem,
  onUncompleteItem,
  plan,
  section,
  status,
}: {
  isCompleting: boolean;
  isCompletingItem: boolean;
  isLocked: boolean;
  isReviewOnly: boolean;
  onClose: () => void;
  onComplete: () => void;
  onCompleteItem: (
    section: ImmersionSectionKey,
    itemKey: string,
    answer?: string,
  ) => void;
  onUncompleteItem: (
    section: ImmersionSectionKey,
    itemKey: string,
  ) => void;
  plan: DailyImmersionPlanWithProgress;
  section: ImmersionSectionKey;
  status: LearningSectionStatus;
}) {
  const config = SECTION_CONFIG[section];
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const canCompleteSection = status.completed_count >= status.item_count;

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  }, [plan.day, section]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
      <section
        aria-modal="true"
        className="max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-outline/20 bg-surface shadow-2xl"
        role="dialog"
      >
        <header className="flex items-start justify-between gap-4 border-b border-outline/15 px-6 py-5">
          <div>
            <p className="mb-1 text-[12px] font-bold uppercase tracking-[0.1em] text-primary">
              Day {plan.day}
            </p>
            <h3 className="text-[24px] font-bold text-on-surface">{config.title}</h3>
          </div>
          <button
            aria-label="Close"
            className="rounded-full border border-outline/15 p-2 text-on-surface/65 transition-colors hover:bg-primary/10 hover:text-primary"
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="max-h-[58vh] overflow-y-auto px-6 py-6" ref={bodyRef}>
          <SectionContent
            isCompletingItem={isCompletingItem}
            isSectionCompleted={status.is_completed}
            onCompleteItem={onCompleteItem}
            onUncompleteItem={onUncompleteItem}
            plan={plan}
            section={section}
          />
        </div>

        <footer className="flex flex-col gap-3 border-t border-outline/15 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <span
            className={`text-sm font-bold uppercase tracking-[0.1em] ${
              status.is_completed ? "text-tertiary" : "text-on-surface/55"
            }`}
          >
            {status.is_completed
              ? "Completed"
              : `${status.completed_count}/${status.item_count} reviewed`}
          </span>
          <div className="flex gap-3">
            <button
              className="rounded-xl border border-outline/15 px-5 py-3 font-bold text-on-surface transition-colors hover:bg-primary/10"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
            <button
              className="rounded-xl bg-primary px-5 py-3 font-bold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={status.is_completed || isCompleting || isLocked || !canCompleteSection}
              onClick={onComplete}
              type="button"
            >
              {isCompleting
                ? "Saving..."
                : isReviewOnly
                  ? "Review Only"
                  : status.is_completed
                    ? "Completed"
                    : "Mark Complete"}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

function SectionContent({
  isCompletingItem,
  isSectionCompleted,
  onCompleteItem,
  onUncompleteItem,
  plan,
  section,
}: {
  isCompletingItem: boolean;
  isSectionCompleted: boolean;
  onCompleteItem: (
    section: ImmersionSectionKey,
    itemKey: string,
    answer?: string,
  ) => void;
  onUncompleteItem: (
    section: ImmersionSectionKey,
    itemKey: string,
  ) => void;
  plan: DailyImmersionPlanWithProgress;
  section: ImmersionSectionKey;
}) {
  if (section === "phrases") {
    return (
      <ul className="grid gap-3">
        {plan.essential_phrases.map((phrase, index) => (
          <li key={`${phrase.text}-${index}`}>
            <button
              className={`w-full rounded-xl border p-4 text-left transition-colors ${
                phrase.is_completed
                  ? "border-tertiary/40 bg-tertiary/10"
                  : "border-outline/15 bg-surface-container-lowest hover:border-primary/50 hover:bg-primary/10"
              }`}
              disabled={isCompletingItem || (phrase.is_completed && isSectionCompleted)}
              onClick={() => (
                phrase.is_completed
                  ? onUncompleteItem("phrases", phrase.item_key)
                  : onCompleteItem("phrases", phrase.item_key)
              )}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-on-surface">{phrase.text}</p>
                  <p className="mt-1 text-on-surface/65">{phrase.translation}</p>
                </div>
                <span className={`material-symbols-outlined ${phrase.is_completed ? "text-tertiary" : "text-on-surface/50"}`}>
                  {phrase.is_completed ? "check_circle" : "add_circle"}
                </span>
              </div>
              {phrase.is_completed ? (
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.1em] text-tertiary">
                  Reviewed +{phrase.xp_awarded} XP
                  {!isSectionCompleted ? " - click to undo" : ""}
                </p>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    );
  }

  if (section === "vocabulary") {
    return (
      <ul className="grid gap-3">
        {plan.vocabulary_words.map((word, index) => (
          <li key={`${word.word}-${index}`}>
            <button
              className={`w-full rounded-xl border p-4 text-left transition-colors ${
                word.is_completed
                  ? "border-tertiary/40 bg-tertiary/10"
                  : "border-outline/15 bg-surface-container-lowest hover:border-primary/50 hover:bg-primary/10"
              }`}
              disabled={isCompletingItem || (word.is_completed && isSectionCompleted)}
              onClick={() => (
                word.is_completed
                  ? onUncompleteItem("vocabulary", word.item_key)
                  : onCompleteItem("vocabulary", word.item_key)
              )}
              type="button"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <p className="text-lg font-bold text-on-surface">{word.word}</p>
                <span className="rounded-full bg-primary/15 px-2 py-1 text-xs font-bold uppercase tracking-[0.08em] text-primary">
                  {word.theme}
                </span>
                {word.is_completed ? (
                  <span className="material-symbols-outlined text-tertiary">check_circle</span>
                ) : null}
              </div>
              <p className="text-on-surface/80">{word.definition}</p>
              <p className="mt-2 text-sm text-on-surface/55">{word.example_sentence}</p>
              <p className="mt-2 text-sm font-semibold text-tertiary">{word.memory_tip}</p>
            </button>
          </li>
        ))}
      </ul>
    );
  }

  if (section === "grammar") {
    return (
      <ul className="grid gap-3">
        {plan.grammar_points.map((point, index) => (
          <li key={`${point.title}-${index}`}>
            <button
              className={`w-full rounded-xl border p-4 text-left transition-colors ${
                point.is_completed
                  ? "border-tertiary/40 bg-tertiary/10"
                  : "border-outline/15 bg-surface-container-lowest hover:border-primary/50 hover:bg-primary/10"
              }`}
              disabled={isCompletingItem || (point.is_completed && isSectionCompleted)}
              onClick={() => (
                point.is_completed
                  ? onUncompleteItem("grammar", point.item_key)
                  : onCompleteItem("grammar", point.item_key)
              )}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-lg font-bold text-on-surface">{point.title}</p>
                <span className={`material-symbols-outlined ${point.is_completed ? "text-tertiary" : "text-on-surface/50"}`}>
                  {point.is_completed ? "check_circle" : "add_circle"}
                </span>
              </div>
              <p className="mt-2 text-on-surface/80">{point.explanation}</p>
              <p className="mt-2 rounded-lg bg-surface-container-low p-3 text-sm text-on-surface/65">
                {point.example}
              </p>
            </button>
          </li>
        ))}
      </ul>
    );
  }

  if (section === "grammar_practice") {
    return (
      <div className="space-y-4">
        {plan.grammar_practice_items.map((item, index) => (
          <div
            className="rounded-xl border border-outline/15 bg-surface-container-lowest p-4"
            key={`${item.title}-${index}`}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-on-surface">{item.title}</p>
                <p className="mt-1 text-on-surface/70">{item.prompt}</p>
              </div>
              {item.is_completed ? (
                <span className="material-symbols-outlined text-tertiary">check_circle</span>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {item.options.map((option) => (
                <button
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    item.selected_answer === option
                      ? item.is_correct
                        ? "border-tertiary/60 bg-tertiary/15 text-tertiary"
                        : "border-error/60 bg-error/15 text-error"
                      : "border-outline/20 text-on-surface/75 hover:border-primary/50 hover:text-primary"
                  }`}
                  disabled={item.is_completed || isCompletingItem}
                  key={option}
                  onClick={() => onCompleteItem("grammar_practice", item.item_key, option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
            {item.is_completed ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className={`text-sm font-semibold ${item.is_correct ? "text-tertiary" : "text-error"}`}>
                    {item.is_correct ? "Correct" : `Correct answer: ${item.answer}`}
                  </p>
                  <p className="mt-1 text-sm text-on-surface/65">{item.explanation}</p>
                </div>
                {!isSectionCompleted ? (
                  <button
                    className="rounded-lg border border-outline/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-on-surface/70 transition-colors hover:border-primary/50 hover:text-primary"
                    disabled={isCompletingItem}
                    onClick={() => onUncompleteItem("grammar_practice", item.item_key)}
                    type="button"
                  >
                    Undo answer
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  if (section === "speaking") {
    return (
      <SpeakingPractice
        isCompletingItem={isCompletingItem}
        isSectionCompleted={isSectionCompleted}
        onCompleteItem={onCompleteItem}
        onUncompleteItem={onUncompleteItem}
        plan={plan}
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-lg font-bold text-on-surface">{plan.quiz.title}</p>
      {plan.quiz.questions.map((question, index) => (
        <div className="rounded-xl border border-outline/15 bg-surface-container-lowest p-4" key={`${question.prompt}-${index}`}>
          <p className="font-bold text-on-surface">{question.prompt}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {question.options.map((option) => (
              <button
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  question.selected_answer === option
                    ? question.is_correct
                      ? "border-tertiary/60 bg-tertiary/15 text-tertiary"
                      : "border-error/60 bg-error/15 text-error"
                    : "border-outline/20 text-on-surface/75 hover:border-primary/50 hover:text-primary"
                }`}
                disabled={question.is_completed || isCompletingItem}
                key={option}
                onClick={() => onCompleteItem("quiz", question.item_key, option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
          {question.is_completed ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className={`text-sm font-semibold ${question.is_correct ? "text-tertiary" : "text-error"}`}>
                {question.is_correct ? "Correct" : `Correct answer: ${question.answer}`}
              </p>
              {!isSectionCompleted ? (
                <button
                  className="rounded-lg border border-outline/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-on-surface/70 transition-colors hover:border-primary/50 hover:text-primary"
                  disabled={isCompletingItem}
                  onClick={() => onUncompleteItem("quiz", question.item_key)}
                  type="button"
                >
                  Undo answer
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function SpeakingPractice({
  isCompletingItem,
  isSectionCompleted,
  onCompleteItem,
  onUncompleteItem,
  plan,
}: {
  isCompletingItem: boolean;
  isSectionCompleted: boolean;
  onCompleteItem: (
    section: ImmersionSectionKey,
    itemKey: string,
    answer?: string,
  ) => void;
  onUncompleteItem: (
    section: ImmersionSectionKey,
    itemKey: string,
  ) => void;
  plan: DailyImmersionPlanWithProgress;
}) {
  const speakingStatus = plan.speaking_practice;
  const [practiceText, setPracticeText] = useState(speakingStatus.answer ?? "");
  const isCompleted = speakingStatus.is_completed;

  useEffect(() => {
    setPracticeText(speakingStatus.answer ?? "");
  }, [speakingStatus.answer]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-outline/15 bg-surface-container-lowest p-5">
        <p className="text-lg leading-8 text-on-surface">{plan.speaking_exercise}</p>
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-bold uppercase tracking-[0.1em] text-on-surface/55">
          Practice response
        </span>
        <textarea
          className="min-h-32 w-full resize-none rounded-xl border border-outline/15 bg-surface-container-low p-4 text-on-surface outline-none transition-colors placeholder:text-on-surface/40 focus:border-primary/50"
          disabled={isCompleted}
          onChange={(event) => setPracticeText(event.target.value)}
          placeholder="Write what you practiced speaking aloud..."
          value={practiceText}
        />
      </label>
      <button
        className="rounded-xl bg-primary px-5 py-3 font-bold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isCompleted || isCompletingItem || practiceText.trim().length < 8}
        onClick={() => onCompleteItem("speaking", "practice", practiceText)}
        type="button"
      >
        {isCompleted ? "Practice Saved" : "Save Practice"}
      </button>
      {speakingStatus.feedback ? (
        <div className="rounded-xl border border-tertiary/30 bg-tertiary/10 p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-tertiary">
              Speaking feedback
            </p>
            <span className="rounded-full bg-tertiary/15 px-3 py-1 text-sm font-bold text-tertiary">
              {speakingStatus.feedback.score}/100
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-bold text-on-surface">Strengths</p>
              <ul className="space-y-1 text-sm text-on-surface/75">
                {speakingStatus.feedback.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-on-surface">Corrections</p>
              <ul className="space-y-1 text-sm text-on-surface/75">
                {speakingStatus.feedback.corrections.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-4 rounded-lg bg-surface-container-low p-3">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.1em] text-on-surface/55">
              Improved answer
            </p>
            <p className="text-sm text-on-surface/80">{speakingStatus.feedback.improved_answer}</p>
          </div>
          <p className="mt-3 text-sm font-semibold text-tertiary">
            {speakingStatus.feedback.next_step}
          </p>
        </div>
      ) : null}
      {isCompleted && !isSectionCompleted ? (
        <button
          className="rounded-xl border border-outline/15 px-5 py-3 font-bold text-on-surface transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isCompletingItem}
          onClick={() => onUncompleteItem("speaking", "practice")}
          type="button"
        >
          Undo Practice
        </button>
      ) : null}
    </div>
  );
}

function applySectionCompletionResult(
  plan: DailyImmersionPlanWithProgress,
  result: CompleteLessonSectionResult,
): DailyImmersionPlanWithProgress {
  const itemLookup = new Map(
    result.items.map((item) => [`${item.section}:${item.item_key}`, item]),
  );

  return {
    ...plan,
    progress_percent: result.progress_percent,
    sections: result.sections,
    items: result.items,
    essential_phrases: plan.essential_phrases.map((phrase) => {
      const progress = itemLookup.get(`phrases:${phrase.item_key}`);
      return progress
        ? {
            ...phrase,
            is_completed: progress.is_completed,
            xp_awarded: progress.xp_awarded,
            completed_at: progress.completed_at,
          }
        : phrase;
    }),
    vocabulary_words: plan.vocabulary_words.map((word) => {
      const progress = itemLookup.get(`vocabulary:${word.item_key}`);
      return progress
        ? {
            ...word,
            is_completed: progress.is_completed,
            xp_awarded: progress.xp_awarded,
            completed_at: progress.completed_at,
          }
        : word;
    }),
    grammar_points: plan.grammar_points.map((point) => {
      const progress = itemLookup.get(`grammar:${point.item_key}`);
      return progress
        ? {
            ...point,
            is_completed: progress.is_completed,
            xp_awarded: progress.xp_awarded,
            completed_at: progress.completed_at,
          }
        : point;
    }),
    grammar_practice_items: plan.grammar_practice_items.map((item) => {
      const progress = itemLookup.get(`grammar_practice:${item.item_key}`);
      return progress
        ? {
            ...item,
            is_completed: progress.is_completed,
            selected_answer: progress.answer,
            is_correct: progress.is_correct,
            xp_awarded: progress.xp_awarded,
            completed_at: progress.completed_at,
          }
        : item;
    }),
    speaking_practice: (() => {
      const progress = itemLookup.get("speaking:practice");
      return progress
        ? {
            ...plan.speaking_practice,
            is_completed: progress.is_completed,
            answer: progress.answer,
            score: progress.score,
            feedback: progress.feedback,
            xp_awarded: progress.xp_awarded,
            completed_at: progress.completed_at,
          }
        : plan.speaking_practice;
    })(),
    quiz: {
      ...plan.quiz,
      questions: plan.quiz.questions.map((question) => {
        const progress = itemLookup.get(`quiz:${question.item_key}`);
        return progress
          ? {
              ...question,
              is_completed: progress.is_completed,
              selected_answer: progress.answer,
              is_correct: progress.is_correct,
              xp_awarded: progress.xp_awarded,
              completed_at: progress.completed_at,
            }
          : question;
      }),
    },
  };
}

function buildSectionSuccessMessage(
  section: ImmersionSectionKey,
  result: CompleteLessonSectionResult,
) {
  if (result.lesson_completed) {
    return `Parabéns! Você concluiu o Day ${result.day} e avançou no Immersion Plan.`;
  }

  return `Parabéns! ${SECTION_CONFIG[section].title} foi concluído.`;
}

function trimText(value: string, limit: number) {
  if (value.length <= limit) {
    return value;
  }
  return `${value.slice(0, limit).trim()}...`;
}

function formatDateRange(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });
  return `${formatter.format(new Date(`${startDate}T00:00:00`))}-${formatter.format(
    new Date(`${endDate}T00:00:00`),
  )}`;
}
