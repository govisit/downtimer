import { decodeTime } from "$std/ulid/mod.ts";
import { Log } from "../../shared/types.ts";
import { getTimer } from "./timers.ts";

const LOG_PREFIX = "logs";
const LOG_BY_TIMER_PREFIX = "logs_by_timer";

export const getLogKey = (
  id: string,
): string[] => [LOG_PREFIX, id];

export const getLogByTimerKey = (
  id: string,
  timerId: string,
): string[] => [LOG_BY_TIMER_PREFIX, timerId, id];

/**
 * @throws {Error} When the timerId is provided, but the timer with that id is not found.
 */
export async function insertLog(
  kv: Deno.Kv,
  log: Log,
): Promise<Deno.KvCommitResult | Deno.KvCommitError> {
  const logKey = getLogKey(log.id);
  const logByTimerKey = getLogByTimerKey(log.id, log.timerId);

  const timer = await getTimer(kv, log.timerId);

  if (timer.value === null) {
    throw new Error(`Timer with Id '${log.timerId}' does not exist.`);
  }

  return await kv.atomic()
    .check({
      key: logKey,
      versionstamp: null,
    })
    .set(logKey, log)
    .set(logByTimerKey, log)
    .commit();
}

export async function getLogs(kv: Deno.Kv): Promise<Log[]> {
  const logs: Log[] = [];

  for await (const res of kv.list<Log>({ prefix: [LOG_PREFIX] })) {
    logs.push(res.value);
  }

  return logs;
}

export async function getLogsByTimer(
  kv: Deno.Kv,
  timerId: string,
): Promise<Log[]> {
  const logs: Log[] = [];

  for await (
    const res of kv.list<Log>({ prefix: [LOG_BY_TIMER_PREFIX, timerId] })
  ) {
    logs.push(res.value);
  }

  // Always sort logs from newest to oldest.
  return logs.sort((a, b) => decodeTime(a.id) - decodeTime(b.id));
}

export async function getLog(
  kv: Deno.Kv,
  id: string,
): Promise<Deno.KvEntryMaybe<Log>> {
  const key = getLogKey(id);

  return (await kv.get<Log>(key));
}

export async function deleteLog(
  kv: Deno.Kv,
  id: string,
): Promise<void> {
  const log = await getLog(kv, id);

  if (log.value === null) return;

  const logByTimerKey = getLogByTimerKey(id, log.value.timerId);

  await kv
    .atomic()
    .delete(log.key)
    .delete(logByTimerKey)
    .commit();
}
