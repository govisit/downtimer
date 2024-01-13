import { decodeTime } from "$std/ulid/mod.ts";
import { Log, TimerStatus } from "../shared/types.ts";
import { getLogsByTimer } from "./db/logs.ts";
import { generateId } from "./utils.ts";

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

export async function getLatestLogForTimer(
  kv: Deno.Kv,
  timerId: string,
): Promise<Log | undefined> {
  const logs = await getLogsByTimer(kv, timerId);

  const firstLog = logs.toSorted((a, b) => decodeTime(b.id) - decodeTime(a.id))
    .at(0);

  if (!firstLog) {
    return undefined;
  }

  return firstLog;
}
