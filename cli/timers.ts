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
import { decodeTime } from "$std/ulid/mod.ts";

export function newTimer(
  name: string,
  duration: number,
  topicId?: string,
  templateId?: string,
  seedTime?: number,
): Timer {
  return {
    id: generateId(seedTime),
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
  seedTime?: number,
): Timer {
  return {
    id: generateId(seedTime),
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

export async function completeTimer(
  kv: Deno.Kv,
  timer: Timer,
  completedAt?: number,
): Promise<Log> {
  return await insertNewLog(kv, timer.id, TimerStatus.Completed, completedAt);
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

    return getElapsedTime(timer, restLogs, nextLog);
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
          return getElapsedTime(timer, restLogs, nextLog, elapsedTime);
        case TimerStatus.Started:
          throw new Error("This should not happen! Check logs.");
        case TimerStatus.Paused:
          // In case that there are two Paused logs one next to each other,
          // this moves things along, instead of throwing an error.
          return getElapsedTime(timer, restLogs, nextLog, elapsedTime);
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
        const startedAt = decodeTime(currentLog.id);
        const now = Date.now();

        return now - startedAt;
      }

      switch (nextLog.timerStatus) {
        case TimerStatus.Started:
          throw new Error("This should not happen! Check logs.");
        case TimerStatus.Paused: {
          const startedAt = decodeTime(currentLog.id);
          const pausedAt = decodeTime(nextLog.id);

          const calculatedTime = elapsedTime + (pausedAt - startedAt);

          return getElapsedTime(timer, restLogs, nextLog, calculatedTime);
        }
        case TimerStatus.Resumed:
          throw new Error("This should not happen! Check logs.");
        case TimerStatus.Completed: {
          const startedAt = decodeTime(currentLog.id);
          const completedAt = decodeTime(nextLog.id);

          console.log({ startedAt, completedAt, elapsedTime });

          return elapsedTime + (completedAt - startedAt);
        }
        case TimerStatus.ManualCompleted: {
          const startedAt = decodeTime(currentLog.id);
          const manualCompletedAt = decodeTime(nextLog.id);

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
        const resumedAt = decodeTime(currentLog.id);
        const now = Date.now();

        return elapsedTime + (now - resumedAt);
      }

      switch (nextLog.timerStatus) {
        case TimerStatus.Started:
          throw new Error("This should not happen! Check logs.");
        case TimerStatus.Paused: {
          const resumedAt = decodeTime(currentLog.id);
          const pausedAt = decodeTime(nextLog.id);

          const calculatedTime = elapsedTime + (pausedAt - resumedAt);

          return getElapsedTime(timer, restLogs, nextLog, calculatedTime);
        }
        case TimerStatus.Resumed:
          // In case that there are two Resumed logs one next to each other,
          // this moves things along, instead of throwing an error.
          return getElapsedTime(timer, restLogs, nextLog, elapsedTime);
        case TimerStatus.Completed: {
          const resumedAt = decodeTime(currentLog.id);
          const completedAt = decodeTime(nextLog.id);

          return elapsedTime + (completedAt - resumedAt);
        }
        case TimerStatus.ManualCompleted: {
          const resumedAt = decodeTime(currentLog.id);
          const manualCompletedAt = decodeTime(nextLog.id);

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
    ? getElapsedTime(timer, timer.logs)
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
  const activeTimers = await getActiveTimers(kv);

  for (const timer of activeTimers) {
    const elapsedTime = getElapsedTime(timer, timer.logs);
    const remainingTime = getRemainingTime(timer, elapsedTime);

    console.log({ elapsedTime, remainingTime }, "cron", timer.duration);

    if (remainingTime === 0) {
      const completedAt = calcCompletedAtTime(elapsedTime, timer);

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
  logId: string,
  isManualCompleted: boolean,
): string {
  const manualSuffix = isManualCompleted ? " (Manual)" : "";
  return `${getPrettyDate(logId)}${manualSuffix}`;
}

export async function formatTimerForTable(kv: Deno.Kv, timer: TimerWithLogs) {
  const remainingTime = getRemainingTime(timer);

  const topic = timer.topicId ? await getTopic(kv, timer.topicId) : undefined;

  const test = [
    ["Name", timer.name],
    ["Duration", getPrettyDuration(timer.duration)],
    ["Status", formatStatus(timer.latestLog.timerStatus)],
    topic?.value ? ["Topic", topic.value.slug] : null,
    timer.templateId ? ["Template", timer.templateId] : null,
    remainingTime ? ["Remaining", getRemainingTimeText(remainingTime)] : null,
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

/**
 * Use only on timer that has timeRemaining 0.
 */
export function calcCompletedAtTime(
  elapsedTime: number,
  timer: Timer,
): number {
  const diff = timer.duration - elapsedTime;

  if (diff > 0) {
    throw new Error("Dogodila se greska. Stoperica nije istekla.");
  }

  const now = Date.now();

  return now - diff;
}
