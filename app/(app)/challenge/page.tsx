"use client";

import { useState } from "react";

import { useLocalStorage } from "@/lib/storage";
import { uid, formatDate, cn } from "@/lib/utils";
import type { Challenge, ChallengeDay, ChallengeType } from "@/lib/types";
import {
  CHALLENGE_TYPES,
  getChallengeType,
  computeStats,
  findDay,
  dateKey,
  todayKey,
  parseKey,
  dayDiff,
  dayNumberFor,
} from "@/lib/challenge";
import { generatePdf } from "@/lib/pdf";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { SingleImageUploader } from "@/components/photo-uploader";
import {
  TargetIcon,
  PlusIcon,
  TrashIcon,
  DownloadIcon,
  ChevronLeftIcon,
  CheckIcon,
  SparklesIcon,
} from "@/components/icons";

export default function ChallengePage() {
  const [challenges, setChallenges] = useLocalStorage<Challenge[]>(
    "challenges",
    []
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const selected = challenges.find((c) => c.id === selectedId) ?? null;

  function updateChallenge(id: string, mut: (c: Challenge) => Challenge) {
    setChallenges((prev) => prev.map((c) => (c.id === id ? mut(c) : c)));
  }

  function removeChallenge(id: string) {
    setChallenges((prev) => prev.filter((c) => c.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function handleCreated(challenge: Challenge) {
    setChallenges((prev) => [challenge, ...prev]);
    setCreateOpen(false);
    setSelectedId(challenge.id);
  }

  if (selected) {
    return (
      <ChallengeDetail
        challenge={selected}
        onBack={() => setSelectedId(null)}
        onUpdate={(mut) => updateChallenge(selected.id, mut)}
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="100 Day Challenge"
        description="Commit to a goal, log daily progress, and watch your streak grow over 100 days."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon className="h-4 w-4" />
            New Challenge
          </Button>
        }
      />

      {challenges.length === 0 ? (
        <EmptyState
          icon={TargetIcon}
          title="No challenges yet"
          description="Start a 100-day challenge and build momentum one day at a time."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon className="h-4 w-4" />
              Create a challenge
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {challenges.map((c) => (
            <ChallengeCard
              key={c.id}
              challenge={c}
              onOpen={() => setSelectedId(c.id)}
              onDelete={() => removeChallenge(c.id)}
            />
          ))}
        </div>
      )}

      <CreateChallengeModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreated}
      />
    </div>
  );
}

/* ----------------------------- List card ----------------------------- */

function ChallengeCard({
  challenge,
  onOpen,
  onDelete,
}: {
  challenge: Challenge;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const meta = getChallengeType(challenge.type);
  const stats = computeStats(challenge);

  return (
    <Card className="group overflow-hidden">
      <div
        className={cn(
          "flex h-28 items-center justify-between bg-gradient-to-br px-5 text-white",
          meta.gradient
        )}
      >
        <span className="text-4xl">{meta.emoji}</span>
        <div className="text-right">
          <p className="text-3xl font-bold leading-none">{stats.percent}%</p>
          <p className="text-xs opacity-80">complete</p>
        </div>
      </div>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{challenge.title}</h3>
            <p className="truncate text-sm text-muted-foreground">
              {meta.label} · {challenge.totalDays} days
            </p>
          </div>
          <button
            onClick={onDelete}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:text-red-500"
            aria-label="Delete challenge"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 text-sm">
          <Badge variant="warning">🔥 {stats.currentStreak} day streak</Badge>
          <span className="text-xs text-muted-foreground">
            {stats.completedCount}/{challenge.totalDays}
          </span>
        </div>

        <ProgressBar percent={stats.percent} accent={meta.accent} className="mt-4" />

        <p className="mt-3 text-xs text-muted-foreground">
          Started {formatDate(challenge.startDate)}
        </p>

        <Button
          variant="outline"
          size="sm"
          className="mt-4 w-full"
          onClick={onOpen}
        >
          Open challenge
        </Button>
      </CardContent>
    </Card>
  );
}

/* --------------------------- Create modal --------------------------- */

function CreateChallengeModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (challenge: Challenge) => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ChallengeType>("fitness");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState(todayKey());
  const [totalDays, setTotalDays] = useState(100);

  const meta = getChallengeType(type);

  function reset() {
    setTitle("");
    setType("fitness");
    setGoal("");
    setStartDate(todayKey());
    setTotalDays(100);
  }

  function submit() {
    if (!title.trim()) return;
    const challenge: Challenge = {
      id: uid("chal"),
      title: title.trim(),
      type,
      goal: goal.trim(),
      startDate: startDate || todayKey(),
      totalDays: Math.max(1, Math.min(365, totalDays || 100)),
      days: [],
      createdAt: new Date().toISOString(),
    };
    onCreate(challenge);
    reset();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New challenge"
      description="Pick a type, set your goal, and choose how many days to commit."
    >
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-medium">Challenge type</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CHALLENGE_TYPES.map((t) => {
              const active = t.type === type;
              return (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => setType(t.type)}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition",
                    active
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:bg-surface-muted"
                  )}
                >
                  <span className="text-xl">{t.emoji}</span>
                  <span className="text-sm font-medium">{t.label}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {meta.description}
          </p>
        </div>

        <Field label="Title">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My 100 days of fitness"
            autoFocus
          />
        </Field>

        <Field label="Goal" hint="What does completing a day look like?">
          <Input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder={meta.goalPlaceholder}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Field>
          <Field label="Total days">
            <Input
              type="number"
              min={1}
              max={365}
              value={totalDays}
              onChange={(e) => setTotalDays(Number(e.target.value))}
            />
          </Field>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!title.trim()}>
            Start challenge
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* ----------------------------- Detail ----------------------------- */

function ChallengeDetail({
  challenge,
  onBack,
  onUpdate,
}: {
  challenge: Challenge;
  onBack: () => void;
  onUpdate: (mut: (c: Challenge) => Challenge) => void;
}) {
  const meta = getChallengeType(challenge.type);
  const stats = computeStats(challenge);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  function logDay(key: string, patch: Partial<ChallengeDay>) {
    onUpdate((c) => {
      const existing = findDay(c, key);
      if (existing) {
        return {
          ...c,
          days: c.days.map((d) =>
            d.date === key ? { ...d, ...patch } : d
          ),
        };
      }
      const day: ChallengeDay = {
        id: uid("day"),
        dayNumber: dayNumberFor(c, key),
        date: key,
        note: "",
        completed: false,
        ...patch,
      };
      return { ...c, days: [...c.days, day] };
    });
  }

  function toggleComplete(key: string) {
    const existing = findDay(challenge, key);
    logDay(key, { completed: !existing?.completed });
  }

  function exportSummary() {
    const sorted = [...challenge.days]
      .filter((d) => d.note || d.image || d.completed)
      .sort((a, b) => parseKey(a.date).getTime() - parseKey(b.date).getTime());
    generatePdf({
      title: challenge.title,
      subtitle: `${meta.label} · ${stats.completedCount}/${challenge.totalDays} days · 🔥 ${stats.longestStreak} best streak`,
      accent: meta.accent,
      footer: "100 Day Challenge · Created with LifeHub",
      sections: sorted.map((d) => ({
        heading: `Day ${d.dayNumber}${d.completed ? " ✓" : ""}`,
        meta: formatDate(d.date),
        body: d.note,
        images: d.image ? [d.image] : [],
      })),
    });
  }

  const activeDay = activeKey ? findDay(challenge, activeKey) : null;
  const activeDayNumber = activeKey
    ? dayNumberFor(challenge, activeKey)
    : 0;

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        All challenges
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-2xl text-white",
              meta.gradient
            )}
          >
            {meta.emoji}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {challenge.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {challenge.goal || meta.description}
            </p>
          </div>
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <Button
            variant="outline"
            onClick={exportSummary}
            disabled={challenge.days.length === 0}
          >
            <DownloadIcon className="h-4 w-4" />
            Export summary
          </Button>
          <Button onClick={() => setActiveKey(todayKey())}>
            <PlusIcon className="h-4 w-4" />
            Log today
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Current streak"
          value={`${stats.currentStreak}`}
          suffix="🔥"
        />
        <StatCard label="Longest streak" value={`${stats.longestStreak}`} />
        <StatCard
          label="Completed"
          value={`${stats.completedCount}`}
          suffix={`/ ${challenge.totalDays}`}
        />
        <StatCard label="Consistency" value={`${stats.consistency}%`} />
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall progress</span>
            <span className="text-muted-foreground">
              {stats.percent}% · {stats.daysRemaining} days left
            </span>
          </div>
          <ProgressBar percent={stats.percent} accent={meta.accent} />
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Progress calendar</h2>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Legend color={meta.accent} label="Done" filled />
              <Legend label="Missed" />
              <Legend label="Today" ring />
            </div>
          </div>
          <ProgressCalendar
            challenge={challenge}
            accent={meta.accent}
            onSelect={(key) => setActiveKey(key)}
          />
        </CardContent>
      </Card>

      {/* Recent entries */}
      <RecentEntries
        challenge={challenge}
        onSelect={(key) => setActiveKey(key)}
        onToggle={toggleComplete}
      />

      {/* Day editor */}
      <DayEditorModal
        open={activeKey !== null}
        dayKey={activeKey}
        dayNumber={activeDayNumber}
        day={activeDay ?? null}
        accent={meta.accent}
        challenge={challenge}
        onClose={() => setActiveKey(null)}
        onSave={(patch) => {
          if (activeKey) logDay(activeKey, patch);
        }}
      />
    </div>
  );
}

/* ----------------------------- Pieces ----------------------------- */

function StatCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight">
          {value}
          {suffix ? (
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              {suffix}
            </span>
          ) : null}
        </p>
      </CardContent>
    </Card>
  );
}

function ProgressBar({
  percent,
  accent,
  className,
}: {
  percent: number;
  accent: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-2.5 w-full overflow-hidden rounded-full bg-surface-muted",
        className
      )}
    >
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${Math.min(100, Math.max(0, percent))}%`,
          backgroundColor: accent,
        }}
      />
    </div>
  );
}

function Legend({
  color,
  label,
  filled,
  ring,
}: {
  color?: string;
  label: string;
  filled?: boolean;
  ring?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={cn(
          "h-3 w-3 rounded-[4px] border",
          filled ? "border-transparent" : "border-border bg-surface-muted",
          ring && "ring-2 ring-primary ring-offset-1 ring-offset-background"
        )}
        style={filled && color ? { backgroundColor: color } : undefined}
      />
      {label}
    </span>
  );
}

function ProgressCalendar({
  challenge,
  accent,
  onSelect,
}: {
  challenge: Challenge;
  accent: string;
  onSelect: (key: string) => void;
}) {
  const today = todayKey();
  const cells = Array.from({ length: challenge.totalDays }, (_, i) => {
    const date = parseKey(challenge.startDate);
    date.setDate(date.getDate() + i);
    const key = dateKey(date);
    const day = findDay(challenge, key);
    return { dayNumber: i + 1, key, day };
  });

  return (
    <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-10">
      {cells.map((cell) => {
        const completed = cell.day?.completed;
        const isToday = cell.key === today;
        const isFuture = dayDiff(today, cell.key) > 0;
        return (
          <button
            key={cell.key}
            type="button"
            onClick={() => onSelect(cell.key)}
            title={`Day ${cell.dayNumber} · ${formatDate(cell.key)}`}
            className={cn(
              "relative flex aspect-square items-center justify-center rounded-md text-[11px] font-medium transition",
              completed
                ? "text-white"
                : isFuture
                  ? "bg-surface-muted/50 text-muted-foreground/60"
                  : "bg-surface-muted text-muted-foreground hover:bg-border",
              isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background"
            )}
            style={completed ? { backgroundColor: accent } : undefined}
          >
            {completed ? (
              <CheckIcon className="h-3.5 w-3.5" />
            ) : (
              cell.dayNumber
            )}
          </button>
        );
      })}
    </div>
  );
}

function RecentEntries({
  challenge,
  onSelect,
  onToggle,
}: {
  challenge: Challenge;
  onSelect: (key: string) => void;
  onToggle: (key: string) => void;
}) {
  const entries = [...challenge.days]
    .filter((d) => d.note || d.image || d.completed)
    .sort((a, b) => parseKey(b.date).getTime() - parseKey(a.date).getTime())
    .slice(0, 12);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">
        Daily entries{" "}
        <span className="text-sm font-normal text-muted-foreground">
          ({entries.length})
        </span>
      </h2>

      {entries.length === 0 ? (
        <EmptyState
          icon={SparklesIcon}
          title="No entries yet"
          description="Log your first day to start building a streak."
        />
      ) : (
        <div className="space-y-3">
          {entries.map((d) => (
            <Card key={d.id}>
              <CardContent className="flex items-start gap-4 pt-5">
                <button
                  onClick={() => onToggle(d.date)}
                  className={cn(
                    "mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border transition",
                    d.completed
                      ? "border-transparent bg-emerald-500 text-white"
                      : "border-border text-transparent hover:border-emerald-500"
                  )}
                  aria-label={d.completed ? "Mark incomplete" : "Mark complete"}
                >
                  <CheckIcon className="h-4 w-4" />
                </button>

                {d.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={d.image}
                    alt=""
                    className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
                  />
                ) : null}

                <button
                  onClick={() => onSelect(d.date)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={d.completed ? "success" : "default"}>
                      Day {d.dayNumber}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(d.date)}
                    </span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                    {d.note || "No note for this day."}
                  </p>
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function DayEditorModal({
  open,
  dayKey,
  dayNumber,
  day,
  accent,
  challenge,
  onClose,
  onSave,
}: {
  open: boolean;
  dayKey: string | null;
  dayNumber: number;
  day: ChallengeDay | null;
  accent: string;
  challenge: Challenge;
  onClose: () => void;
  onSave: (patch: Partial<ChallengeDay>) => void;
}) {
  const [note, setNote] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
  const [completed, setCompleted] = useState(false);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  // Sync local form with the day being edited whenever it changes.
  if (open && dayKey && loadedKey !== dayKey) {
    setNote(day?.note ?? "");
    setImage(day?.image);
    setCompleted(day?.completed ?? false);
    setLoadedKey(dayKey);
  }
  if (!open && loadedKey !== null) {
    setLoadedKey(null);
  }

  const withinRange =
    dayKey !== null && dayNumber >= 1 && dayNumber <= challenge.totalDays;

  function save() {
    onSave({ note: note.trim(), image, completed });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={dayKey ? `Day ${dayNumber}` : "Log day"}
      description={dayKey ? formatDate(dayKey) : undefined}
    >
      {!withinRange ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This date is outside the challenge range (Day 1–
            {challenge.totalDays}). Pick a day inside the calendar.
          </p>
          <div className="flex justify-end">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setCompleted((v) => !v)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition",
              completed
                ? "border-emerald-500 bg-emerald-500/5"
                : "border-border hover:bg-surface-muted"
            )}
          >
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border transition",
                completed
                  ? "border-transparent bg-emerald-500 text-white"
                  : "border-border text-transparent"
              )}
            >
              <CheckIcon className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium">
              {completed ? "Completed this day 🎉" : "Mark this day complete"}
            </span>
          </button>

          <Field label="Progress note">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What did you do today? How did it go?"
            />
          </Field>

          <div>
            <p className="mb-1.5 text-sm font-medium">Photo (optional)</p>
            <SingleImageUploader
              image={image}
              onChange={setImage}
              label="Add photo"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={save} style={{ backgroundColor: accent }}>
              Save day
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
