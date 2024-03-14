import { decodeTime } from "$std/ulid/mod.ts";
import { Log, TimerStatus, TimerWithLogs } from "../shared/types.ts";

type Time = number;
type ElapsedTime = Time;

export function getElapsedTime(
  timer: TimerWithLogs,
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
          return timer.duration;
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
        case TimerStatus.Completed:
          return timer.duration;
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
        case TimerStatus.Completed:
          return timer.duration;
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
