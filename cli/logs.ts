import { Log, TimerStatus } from "../shared/types.ts";
import { generateId } from "./utils.ts";

export function newLog(
  timerId: string,
  timerStatus: TimerStatus = TimerStatus.Started,
  seedTime?: number,
): Log {
  return {
    id: generateId(seedTime),
    timerId: timerId,
    timerStatus: timerStatus,
  };
}
