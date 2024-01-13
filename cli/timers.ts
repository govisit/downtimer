import { decodeTime } from "$std/ulid/mod.ts";
import { Log, Template, Timer, TimerStatus } from "../shared/types.ts";
import { generateId } from "./utils.ts";
import { insertLog } from "./db/logs.ts";
import { getTimers, insertTimer } from "./db/timers.ts";
import { getLatestLogForTimer, newLog } from "./logs.ts";

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

export async function withStatus(
  kv: Deno.Kv,
  timer: Timer,
): Promise<TimerWithStatus> {
  const log = await getLatestLogForTimer(kv, timer.id);

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

export async function getAllTimers(kv: Deno.Kv): Promise<TimerWithStatus[]> {
  return (await Promise.all(
    await getTimers(kv).then((timers) =>
      timers.map((timer) => withStatus(kv, timer))
    ),
  ));
}

export async function getActiveTimers(kv: Deno.Kv): Promise<TimerWithStatus[]> {
  return (await getAllTimers(kv)).filter((timer) =>
    timer.status && activeStatuses.includes(timer.status)
  );
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
