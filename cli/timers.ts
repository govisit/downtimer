import {
  Log,
  Template,
  Timer,
  TimerStatus,
  TimerWithLogs,
} from "../shared/types.ts";
import { generateId, getPrettyDate, getPrettyDuration } from "./utils.ts";
import { getLogsByTimer, insertLog } from "./db/logs.ts";
import { getTimers, insertTimer } from "./db/timers.ts";
import { newLog } from "./logs.ts";
import { getTopic } from "./db/topics.ts";
import { capitalize } from "./utils.ts";
import { getElapsedTime } from "./timers-advanced.ts";

export function newTimer(
  name: string,
  duration: number,
  topicId?: string,
  templateId?: string,
): Timer {
  return {
    id: generateId(),
    name: name,
    duration: duration,
    topicId: topicId,
    templateId: templateId,
  };
}

export type Overrides = {
  name?: string | undefined;
  duration?: number | undefined;
  topicId?: string | undefined;
};

export function newTimerFromTemplate(
  template: Template,
  overrides: Overrides,
): Timer {
  return {
    id: generateId(),
    name: overrides.name || template.name,
    duration: overrides.duration || template.duration,
    topicId: overrides.topicId || template.topicId,
    templateId: template.id,
  };
}

export async function withLogs(
  kv: Deno.Kv,
  timer: Timer,
): Promise<TimerWithLogs> {
  const logs = await getLogsByTimer(kv, timer.id);

  const latestLog = logs.at(-1);

  if (!latestLog) {
    throw new Error(
      `This is a mistake. If this happens, someone has deleted logs. Timer: ${timer.id}.`,
    );
    // The code bellow is left here in case I want to do something with this in the future.

    // To prevent this from making issues, I will create a new unknown log for a timer.
    // const dummyLog = newLog(timer.id, TimerStatus.Unknown);
    // await insertLog(kv, dummyLog);
  }

  return {
    ...timer,
    logs,
    latestLog,
  };
}

type TimerStartedEvent = {
  timer: Timer;
  log: Log;
};

export async function startTimer(
  kv: Deno.Kv,
  timer: Timer,
): Promise<TimerStartedEvent> {
  await insertTimer(kv, timer);

  const log = newLog(timer.id, TimerStatus.Started);

  await insertLog(kv, log);

  return {
    timer,
    log,
  };
}

async function completeTimer(kv: Deno.Kv, timer: Timer): Promise<void> {
  await insertNewLog(kv, timer.id, TimerStatus.Completed);
}

export async function pauseTimer(kv: Deno.Kv, timer: Timer): Promise<void> {
  await insertNewLog(kv, timer.id, TimerStatus.Paused);
}

export async function resumeTimer(kv: Deno.Kv, timer: Timer): Promise<void> {
  await insertNewLog(kv, timer.id, TimerStatus.Resumed);
}

export async function manualCompleteTimer(
  kv: Deno.Kv,
  timer: Timer,
): Promise<void> {
  await insertNewLog(kv, timer.id, TimerStatus.ManualCompleted);
}

async function insertNewLog(
  kv: Deno.Kv,
  timerId: string,
  status: TimerStatus,
): Promise<void> {
  const log = newLog(timerId, status);

  await insertLog(kv, log);
}

/**
 * @returns It returns the remaining time in miliseconds.
 */
export function getTimeRemaining(
  timer: TimerWithLogs,
): number {
  if (timer.latestLog.timerStatus === TimerStatus.ManualCompleted) {
    return 0;
  }

  return timer.duration - getElapsedTime(timer, timer.logs);
}

/**
 * @param {number} timeRemaining Time in miliseconds.
 */
export function getTimeRemainingText(timeRemaining: number): string {
  const date = new Date(timeRemaining);

  const seconds = date.getUTCSeconds() < 10
    ? `0${date.getUTCSeconds()}`
    : date.getUTCSeconds();
  const minutes = date.getUTCMinutes() < 10
    ? `0${date.getUTCMinutes()}`
    : date.getUTCMinutes();
  const hours = date.getUTCHours() < 10
    ? `0${date.getUTCHours()}`
    : date.getUTCHours();

  return `${hours}:${minutes}:${seconds}`;
}

export function hasTimeExpired(timeRemaining: number): boolean {
  return timeRemaining === 0;
}

export const activeStatuses = [
  TimerStatus.Resumed,
  TimerStatus.Started,
];

export async function getAllTimers(kv: Deno.Kv): Promise<TimerWithLogs[]> {
  return (await Promise.all(
    await getTimers(kv).then((timers) =>
      timers.map((timer) => withLogs(kv, timer))
    ),
  ));
}

export async function getActiveTimers(kv: Deno.Kv): Promise<TimerWithLogs[]> {
  return (await getAllTimers(kv)).filter((timer) => {
    return activeStatuses.includes(timer.latestLog.timerStatus);
  });
}

export async function cron(kv: Deno.Kv) {
  const activeTimers = await getActiveTimers(kv);

  for (const timer of activeTimers) {
    const timeRemaining = getTimeRemaining(timer);

    if (timeRemaining === 0) {
      await completeTimer(kv, timer);
    }
  }
}

export function getTemplateOverrides(
  name?: string,
  duration?: number,
  topicId?: string,
): Overrides {
  return {
    name,
    duration,
    topicId,
  };
}

function getCompletedAtDateFormatted(
  logId: string,
  isManualCompleted: boolean,
): string {
  const manualSuffix = isManualCompleted ? " (Manual)" : "";
  return `${getPrettyDate(logId)}${manualSuffix}`;
}

export async function formatTimerForTable(kv: Deno.Kv, timer: TimerWithLogs) {
  const timeRemaining = getTimeRemaining(timer);

  const topic = timer.topicId ? await getTopic(kv, timer.topicId) : undefined;

  const test = [
    ["Name", timer.name],
    ["Duration", getPrettyDuration(timer.duration)],
    ["Status", formatStatus(timer.latestLog.timerStatus)],
    topic?.value ? ["Topic", topic.value.slug] : null,
    timer.templateId ? ["Template", timer.templateId] : null,
    timeRemaining ? ["Remaining", getTimeRemainingText(timeRemaining)] : null,
    ["Created at", getPrettyDate(timer.id)],
    isCompleted(timer)
      ? [
        "Completed at",
        getCompletedAtDateFormatted(
          timer.latestLog.id,
          isManualCompleted(timer),
        ),
      ]
      : null,
  ].filter(Boolean) as string[][];

  return test;
}

export function formatStatus(status: TimerStatus): string {
  switch (status.toString()) {
    case TimerStatus.ManualCompleted: {
      return `${capitalize(TimerStatus.Completed)} (Manual)`;
    }

    default: {
      return capitalize(status.toString());
    }
  }
}

export function isManualCompleted(timer: TimerWithLogs): boolean {
  return timer.latestLog.timerStatus === TimerStatus.ManualCompleted;
}

const completedTimerStatuses = [
  TimerStatus.Completed,
  TimerStatus.ManualCompleted,
];

export function isCompleted(timer: TimerWithLogs): boolean {
  return completedTimerStatuses.includes(timer.latestLog.timerStatus);
}
