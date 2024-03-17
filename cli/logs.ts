import { Log, TimerStatus } from "../shared/types.ts";
import { generateId } from "./utils.ts";

export function newLog(
  timerId: string,
  timerStatus: TimerStatus = TimerStatus.Started,
  createdAt?: number,
): Log {
  return {
    id: generateId(),
    timerId: timerId,
    timerStatus: timerStatus,
    createdAt: createdAt || Date.now(),
  };
}
