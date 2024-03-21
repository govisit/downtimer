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
import { colors } from "$cliffy/ansi/colors.ts";
import { getTemplate } from "./db/templates.ts";

export function newTimer(
  name: string,
  duration: number,
  topicId?: string,
  templateId?: string,
  createdAt?: number,
): Timer {
  return {
    id: generateId(),
    name: name,
    duration: duration,
    topicId: topicId,
    templateId: templateId,
    createdAt: createdAt || Date.now(),
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
  createdAt?: number,
): Timer {
  return {
    id: generateId(),
    name: overrides.name || template.name,
    duration: overrides.duration || template.duration,
    topicId: overrides.topicId || template.topicId,
    templateId: template.id,
    createdAt: createdAt || Date.now(),
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
  }

  return {
    ...timer,
    logs,
    latestLog,
  };
}

type TimerStartedEvent = {
  timer: TimerWithLogs;
  log: Log;
};

export async function startTimer(
  kv: Deno.Kv,
  timer: Timer,
  startedAt?: number,
): Promise<TimerStartedEvent> {
  await insertTimer(kv, timer);

  const log = newLog(timer.id, TimerStatus.Started, startedAt);

  await insertLog(kv, log);

  const timerWithLogs = await withLogs(kv, timer);

  return {
    timer: timerWithLogs,
    log,
  };
}

export async function completeTimer(
  kv: Deno.Kv,
  timer: Timer,
  completedAt?: number,
): Promise<void> {
  await insertNewLog(kv, timer.id, TimerStatus.Completed, completedAt);
}

export async function pauseTimer(
  kv: Deno.Kv,
  timer: Timer,
  pausedAt?: number,
): Promise<void> {
  await insertNewLog(kv, timer.id, TimerStatus.Paused, pausedAt);
}

export async function resumeTimer(
  kv: Deno.Kv,
  timer: Timer,
  resumedAt?: number,
): Promise<void> {
  await insertNewLog(kv, timer.id, TimerStatus.Resumed, resumedAt);
}

export async function manualCompleteTimer(
  kv: Deno.Kv,
  timer: Timer,
  completedAt?: number,
): Promise<void> {
  await insertNewLog(kv, timer.id, TimerStatus.ManualCompleted, completedAt);
}

async function insertNewLog(
  kv: Deno.Kv,
  timerId: string,
  status: TimerStatus,
  seedTime?: number,
): Promise<Log> {
  const log = newLog(timerId, status, seedTime);

  await insertLog(kv, log);

  return log;
}

type Time = number;
type ElapsedTime = Time;

export function getElapsedTime(
  now: number,
  timer: Timer,
  logs: Log[],
  currentLog?: Log | undefined,
  elapsedTime: Time = 0,
): ElapsedTime {
  if (!currentLog) {
    const [nextLog, ...restLogs] = logs;

    if (!nextLog) {
      throw new Error("Timer has no logs, can't calculate elapsed time.");
    }

    return getElapsedTime(now, timer, restLogs, nextLog);
  }

  switch (currentLog.timerStatus) {
    case TimerStatus.Completed: {
      return elapsedTime;
    }

    case TimerStatus.Paused: {
      const [nextLog, ...restLogs] = logs;

      if (!nextLog) {
        return elapsedTime;
      }

      switch (nextLog.timerStatus) {
        case TimerStatus.Resumed:
          return getElapsedTime(now, timer, restLogs, nextLog, elapsedTime);
        case TimerStatus.Started:
          throw new Error("This should not happen! Check logs.");
        case TimerStatus.Paused:
          // In case that there are two Paused logs one next to each other,
          // this moves things along, instead of throwing an error.
          return getElapsedTime(now, timer, restLogs, nextLog, elapsedTime);
        case TimerStatus.Completed:
          throw new Error("This should not happen! Check logs.");
        case TimerStatus.ManualCompleted:
          return elapsedTime;
        default: {
          const _exhaustiveCheck: never = nextLog.timerStatus;
          return _exhaustiveCheck;
        }
      }
    }

    case TimerStatus.Started: {
      const [nextLog, ...restLogs] = logs;

      // If there is no next log,
      // then calculate elapsed time by subtracting startedAt from now.
      if (!nextLog) {
        const startedAt = currentLog.createdAt;

        return now - startedAt;
      }

      switch (nextLog.timerStatus) {
        case TimerStatus.Started:
          throw new Error("This should not happen! Check logs.");
        case TimerStatus.Paused: {
          const startedAt = currentLog.createdAt;
          const pausedAt = nextLog.createdAt;

          const calculatedTime = elapsedTime + (pausedAt - startedAt);

          return getElapsedTime(now, timer, restLogs, nextLog, calculatedTime);
        }
        case TimerStatus.Resumed:
          throw new Error("This should not happen! Check logs.");
        case TimerStatus.Completed: {
          const startedAt = currentLog.createdAt;
          const completedAt = nextLog.createdAt;

          return elapsedTime + (completedAt - startedAt);
        }
        case TimerStatus.ManualCompleted: {
          const startedAt = currentLog.createdAt;
          const manualCompletedAt = nextLog.createdAt;

          return manualCompletedAt - startedAt;
        }
        default: {
          const _exhaustiveCheck: never = nextLog.timerStatus;
          return _exhaustiveCheck;
        }
      }
    }

    case TimerStatus.ManualCompleted: {
      return elapsedTime;
    }

    case TimerStatus.Resumed: {
      const [nextLog, ...restLogs] = logs;

      // If there is no next log,
      // then calculate elapsed time by subtracting startedAt from now
      // and adding that to already elapsed time.
      if (!nextLog) {
        const resumedAt = currentLog.createdAt;

        return elapsedTime + (now - resumedAt);
      }

      switch (nextLog.timerStatus) {
        case TimerStatus.Started:
          throw new Error("This should not happen! Check logs.");
        case TimerStatus.Paused: {
          const resumedAt = currentLog.createdAt;
          const pausedAt = nextLog.createdAt;

          const calculatedTime = elapsedTime + (pausedAt - resumedAt);

          return getElapsedTime(now, timer, restLogs, nextLog, calculatedTime);
        }
        case TimerStatus.Resumed:
          // In case that there are two Resumed logs one next to each other,
          // this moves things along, instead of throwing an error.
          return getElapsedTime(now, timer, restLogs, nextLog, elapsedTime);
        case TimerStatus.Completed: {
          const resumedAt = currentLog.createdAt;
          const completedAt = nextLog.createdAt;

          return elapsedTime + (completedAt - resumedAt);
        }
        case TimerStatus.ManualCompleted: {
          const resumedAt = currentLog.createdAt;
          const manualCompletedAt = nextLog.createdAt;

          return elapsedTime + (manualCompletedAt - resumedAt);
        }
        default: {
          const _exhaustiveCheck: never = nextLog.timerStatus;
          return _exhaustiveCheck;
        }
      }
    }

    default: {
      const _exhaustiveCheck: never = currentLog.timerStatus;
      return _exhaustiveCheck;
    }
  }
}

/**
 * @returns It returns the remaining time in miliseconds.
 */
export function getRemainingTime(
  timer: TimerWithLogs,
  elapsedTime?: number,
): number {
  if (timer.latestLog.timerStatus === TimerStatus.ManualCompleted) {
    return 0;
  }

  const elapsedTime1 = typeof elapsedTime === "undefined"
    ? getElapsedTime(Date.now(), timer, timer.logs)
    : elapsedTime;

  const remainingTime = timer.duration - elapsedTime1;

  if (remainingTime < 0) {
    return 0;
  }

  return remainingTime;
}

/**
 * @param {number} remainingTime in miliseconds.
 */
export function getRemainingTimeText(remainingTime: number): string {
  const date = new Date(remainingTime);

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

export function hasTimeExpired(remainingTime: number): boolean {
  return remainingTime === 0;
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
  const now = Date.now();

  const activeTimers = await getActiveTimers(kv);

  for (const timer of activeTimers) {
    const elapsedTime = getElapsedTime(now, timer, timer.logs);
    const remainingTime = getRemainingTime(timer, elapsedTime);

    if (remainingTime === 0) {
      const completedAt = calcCompletedAtTime(elapsedTime, timer, now);

      await completeTimer(kv, timer, completedAt);
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
  completedAt: number,
  isManualCompleted: boolean,
): string {
  const manualSuffix = isManualCompleted ? " (Manual)" : "";
  return `${getPrettyDate(completedAt)}${manualSuffix}`;
}

export async function formatTimerForTable(kv: Deno.Kv, timer: TimerWithLogs) {
  const remainingTime = getRemainingTime(timer);

  const topic = timer.topicId ? await getTopic(kv, timer.topicId) : undefined;
  const template = timer.templateId
    ? await getTemplate(kv, timer.templateId)
    : undefined;

  const test = [
    ["Name", timer.name],
    ["Duration", getPrettyDuration(timer.duration)],
    ["Status", formatStatus(timer.latestLog.timerStatus)],
    topic?.value ? ["Topic", `${topic.value.name} #${topic.value.slug}`] : null,
    template?.value
      ? ["Template", `${template.value.name} (${template.value.id})`]
      : null,
    remainingTime ? ["Remaining", getRemainingTimeText(remainingTime)] : null,
    ["Created at", getPrettyDate(timer.createdAt)],
    isCompleted(timer)
      ? [
        "Completed at",
        getCompletedAtDateFormatted(
          timer.latestLog.createdAt,
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
      return colors.brightGreen(
        `${capitalize(TimerStatus.Completed)} (Manual)`,
      );
    }

    case TimerStatus.Completed: {
      return colors.green(capitalize(TimerStatus.Completed));
    }

    case TimerStatus.Started: {
      return colors.blue(capitalize(TimerStatus.Started));
    }

    default: {
      return capitalize(status.toString());
    }
  }
}

export function isManualCompleted(timer: TimerWithLogs): boolean {
  return timer.latestLog.timerStatus === TimerStatus.ManualCompleted;
}

export const completedTimerStatuses = [
  TimerStatus.Completed,
  TimerStatus.ManualCompleted,
];

export function isCompleted(timer: TimerWithLogs): boolean {
  return completedTimerStatuses.includes(timer.latestLog.timerStatus);
}

/**
 * Use only on timer that has remainingTime 0.
 */
export function calcCompletedAtTime(
  elapsedTime: number,
  timer: TimerWithLogs,
  now: number,
): number {
  if (elapsedTime < timer.duration) {
    throw new Error("Timer has not elapsed.");
  }

  const latestLog = timer.latestLog;

  switch (latestLog.timerStatus) {
    case TimerStatus.Started:
    case TimerStatus.Paused:
    case TimerStatus.Resumed: {
      const diff = elapsedTime - timer.duration;
      return now - diff;
    }
    case TimerStatus.Completed:
    case TimerStatus.ManualCompleted:
      return latestLog.createdAt;
    default: {
      const _exhaustiveCheck: never = latestLog.timerStatus;
      return _exhaustiveCheck;
    }
  }
}
