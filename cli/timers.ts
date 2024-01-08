import { decodeTime } from "$std/ulid/mod.ts";
import { Log, Template, Timer, TimerStatus } from "../shared/types.ts";
import { generateId } from "./utils.ts";
import { getLatestLogForTimer, insertLog } from "./db/logs.ts";
import { getTimers, insertTimer } from "./db/timers.ts";
import { newLog } from "./logs.ts";

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

// type TimerWithStatus = Timer & {
//   status: TimerStatus | null;
// };

interface TimerWithStatus extends Timer {
  status: TimerStatus | null;
}

export async function withStatus(timer: Timer): Promise<TimerWithStatus> {
  const log = await getLatestLogForTimer(timer.id);

  if (!log) {
    return {
      ...timer,
      status: null,
    };
  }

  return {
    ...timer,
    status: log.timerStatus,
  };
}

type TimerStartedEvent = {
  timer: Timer;
  log: Log;
};

export async function startTimer(timer: Timer): Promise<TimerStartedEvent> {
  await insertTimer(timer);

  const log = newLog(timer.id, TimerStatus.Started);

  await insertLog(log);

  return {
    timer,
    log,
  };
}

async function completeTimer(timer: Timer): Promise<void> {
  await insertNewLog(timer.id, TimerStatus.Completed);
}

export async function pauseTimer(timer: Timer): Promise<void> {
  await insertNewLog(timer.id, TimerStatus.Paused);
}

export async function resumeTimer(timer: Timer): Promise<void> {
  await insertNewLog(timer.id, TimerStatus.Resumed);
}

export async function manualCompleteTimer(timer: Timer): Promise<void> {
  await insertNewLog(timer.id, TimerStatus.ManualCompleted);
}

async function insertNewLog(
  timerId: string,
  status: TimerStatus,
): Promise<void> {
  const log = newLog(timerId, status);

  await insertLog(log);
}

/**
 * @returns It returns the remaining time in miliseconds.
 */
export function getTimeRemaining(
  timer: TimerWithStatus,
): number {
  const durationInMiliseconds = timer.duration;

  const now = Date.now();

  const startedAt = decodeTime(timer.id);

  const timeElapsed = now - startedAt;

  const timeRemaining = durationInMiliseconds - timeElapsed;

  if (timeRemaining < 0) {
    return 0;
  }

  return timeRemaining;
}

const activeStatuses = [
  TimerStatus.Resumed,
  TimerStatus.Started,
];

export async function getAllTimers(): Promise<TimerWithStatus[]> {
  return (await Promise.all(
    await getTimers().then((timers) =>
      timers.map((timer) => withStatus(timer))
    ),
  ));
}

export async function getActiveTimers(): Promise<TimerWithStatus[]> {
  return (await getAllTimers()).filter((timer) =>
    timer.status && activeStatuses.includes(timer.status)
  );
}

export async function cron() {
  const activeTimers = await getActiveTimers();

  for (const timer of activeTimers) {
    const timeRemaining = getTimeRemaining(timer);

    if (timeRemaining === 0) {
      await completeTimer(timer);
    }
  }
}

/**
 * @returns It should always return the parsed duration in miliseconds or
 * undefined if the duration can't be parsed.
 */
export function parseDuration(duration: string): number | undefined {
  const result = /^([0-9]+)(ms|s|m|h)$/.exec(duration);

  if (!result) {
    return undefined;
  }

  const { 1: value, 2: unit } = result;

  const number = parseInt(value);

  if (isNaN(number)) {
    return undefined;
  }

  switch (unit) {
    case "s":
      return number * 1000;
    case "m":
      return number * 60 * 1000;
    case "h":
      return number * 60 * 60 * 1000;
    default:
      return number;
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
