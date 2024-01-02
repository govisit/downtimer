import { Log, TimerStatus } from "../shared/types.ts";
import { generateId } from "./db.ts";

export function newLog(
  timerId: string,
  timerStatus: TimerStatus = TimerStatus.Started,
): Log {
  return {
    id: generateId(),
    timerId: timerId,
    timerStatus: timerStatus,
  };
}
