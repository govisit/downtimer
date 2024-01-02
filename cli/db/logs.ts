import { kv } from "../db.ts";
import { Log } from "../../shared/types.ts";
import { decodeTime } from "$std/ulid/mod.ts";
import { getTimer } from "./timers.ts";

const LOG_PREFIX = "logs";
const LOG_BY_TIMER_PREFIX = "logs_by_timer";

const getLogKey = (
  id: string,
): string[] => [LOG_PREFIX, id];

const getLogByTimerKey = (
  id: string,
  timerId: string,
): string[] => [LOG_BY_TIMER_PREFIX, timerId, id];

export async function insertLog(
  log: Log,
): Promise<Deno.KvCommitResult | Deno.KvCommitError> {
  const logKey = getLogKey(log.id);
  const logByTimerKey = getLogByTimerKey(log.id, log.timerId);

  const timerRes = await getTimer(log.timerId);

  return await kv.atomic()
    .check({
      key: logKey,
      versionstamp: null,
    })
    .check(timerRes)
    .set(logKey, log)
    .set(logByTimerKey, log)
    .commit();
}

export async function getLogs(): Promise<Log[]> {
  const logs: Log[] = [];

  for await (const res of kv.list<Log>({ prefix: [LOG_PREFIX] })) {
    logs.push(res.value);
  }

  return logs;
}

export async function getLogsByTimer(timerId: string): Promise<Log[]> {
  const logs: Log[] = [];

  for await (
    const res of kv.list<Log>({ prefix: [LOG_BY_TIMER_PREFIX, timerId] })
  ) {
    logs.push(res.value);
  }

  return logs;
}

export async function getLatestLogForTimer(
  timerId: string,
): Promise<Log | undefined> {
  const logs = await getLogsByTimer(timerId);

  const firstLog = logs.toSorted((a, b) => decodeTime(b.id) - decodeTime(a.id))
    .at(0);

  if (!firstLog) {
    return undefined;
  }

  return firstLog;
}

export async function getLog(id: string): Promise<Deno.KvEntryMaybe<Log>> {
  const key = getLogKey(id);

  return (await kv.get<Log>(key));
}

export async function deleteLog(
  id: string,
): Promise<void> {
  const logKey = getLogKey(id);

  let res = { ok: false };

  while (!res.ok) {
    const logRes = await getLog(id);

    if (logRes.value === null) return;

    const logByTimerKey = getLogByTimerKey(id, logRes.value.timerId);

    res = await kv.atomic()
      .check(logRes)
      .delete(logKey)
      .delete(logByTimerKey)
      .commit();
  }
}
