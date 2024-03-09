import { decodeTime } from "$std/ulid/mod.ts";
import { Log, TimerStatus, TimerWithLogs } from "../shared/types.ts";

export function getFirstLog(logs: Log[]): Log | undefined {
  return logs.at(0);
}

type Time = number;
type ElapsedTime = Time;

export function getElapsedTime(
  timer: TimerWithLogs,
  logs: Log[],
  currentLog?: Log | undefined,
  elapsedTime: Time = 0,
): ElapsedTime {
  if (!currentLog) {
    const nextLog = getFirstLog(logs);
    const logs1 = logs.toSpliced(0, 1);

    if (!nextLog) {
      throw new Error("Timer has no logs, can't calculate elapsed time.");
    }

    return getElapsedTime(timer, logs1, nextLog);
  }

  switch (currentLog.timerStatus) {
    case TimerStatus.Completed: {
      return elapsedTime;
    }

    case TimerStatus.Paused: {
      const nextLog = getFirstLog(logs);
      const logs1 = logs.toSpliced(0, 1);

      if (!nextLog) {
        return elapsedTime;
      }

      if (nextLog.timerStatus === TimerStatus.Resumed) {
        return getElapsedTime(timer, logs1, nextLog, elapsedTime);
      }

      if (nextLog.timerStatus === TimerStatus.Paused) {
        return getElapsedTime(timer, logs1, nextLog, elapsedTime);
      }

      if (nextLog.timerStatus === TimerStatus.Completed) {
        return timer.duration;
      }

      if (nextLog.timerStatus === TimerStatus.ManualCompleted) {
        return elapsedTime;
      }

      return elapsedTime;
    }

    case TimerStatus.Started: {
      const nextLog = getFirstLog(logs);
      const logs1 = logs.toSpliced(0, 1);

      if (!nextLog) {
        const startedAt = decodeTime(currentLog.id);
        const now = Date.now();

        return now - startedAt;
      }

      if (nextLog.timerStatus === TimerStatus.Paused) {
        const startedAt = decodeTime(currentLog.id);
        const pausedAt = decodeTime(nextLog.id);

        const calculatedTime = elapsedTime + (pausedAt - startedAt);

        return getElapsedTime(timer, logs1, nextLog, calculatedTime);
      }

      if (nextLog.timerStatus === TimerStatus.Completed) {
        return timer.duration;
      }

      if (nextLog.timerStatus === TimerStatus.ManualCompleted) {
        const startedAt = decodeTime(currentLog.id);
        const manualCompletedAt = decodeTime(nextLog.id);

        return manualCompletedAt - startedAt;
      }

      return getElapsedTime(timer, logs1, nextLog);
    }

    case TimerStatus.Unknown: {
      // TODO: Maybe handle this better.
      console.error("Timer has a log with status unknown.");

      return elapsedTime;
    }

    case TimerStatus.ManualCompleted: {
      return elapsedTime;
    }

    case TimerStatus.Resumed: {
      const nextLog = getFirstLog(logs);
      const logs1 = logs.toSpliced(0, 1);

      if (!nextLog) {
        const resumedAt = decodeTime(currentLog.id);
        const now = Date.now();

        return elapsedTime + (now - resumedAt);
      }

      if (nextLog.timerStatus === TimerStatus.Paused) {
        const resumedAt = decodeTime(currentLog.id);
        const pausedAt = decodeTime(nextLog.id);

        const calculatedTime = elapsedTime + (pausedAt - resumedAt);

        return getElapsedTime(timer, logs1, nextLog, calculatedTime);
      }

      // TODO: Implement others.

      return getElapsedTime(timer, logs1, nextLog, elapsedTime);
    }

    default: {
      const _exhaustiveCheck: never = currentLog.timerStatus;
      return _exhaustiveCheck;
    }
  }
}
