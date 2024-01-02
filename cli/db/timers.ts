import { kv } from "../db.ts";
import { Timer } from "../../shared/types.ts";
import { deleteLog, getLogsByTimer } from "./logs.ts";

const TIMER_PREFIX = "timers";

const getTimerKey = (
  id: string,
): string[] => [TIMER_PREFIX, id];

export async function insertTimer(
  timer: Timer,
): Promise<Deno.KvCommitResult | Deno.KvCommitError> {
  const timerKey = getTimerKey(timer.id);

  return await kv
    .atomic()
    .check({ key: timerKey, versionstamp: null })
    .set(timerKey, timer)
    .commit();
}

export async function getTimers(): Promise<Timer[]> {
  const timers: Timer[] = [];

  for await (const res of kv.list<Timer>({ prefix: ["timers"] })) {
    timers.push(res.value);
  }

  return timers;
}

export async function getTimer(id: string): Promise<Deno.KvEntryMaybe<Timer>> {
  const key = getTimerKey(id);

  return (await kv.get<Timer>(key));
}

export async function deleteTimer(
  id: string,
): Promise<void> {
  const timerKey = getTimerKey(id);

  const logs = await getLogsByTimer(id);

  for (const log of logs) {
    await deleteLog(log.id);
  }

  await kv.delete(timerKey);
}
