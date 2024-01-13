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

export async function insertLog(
  kv: Deno.Kv,
  log: Log,
): Promise<Deno.KvCommitResult | Deno.KvCommitError> {
  const logKey = getLogKey(log.id);
  const logByTimerKey = getLogByTimerKey(log.id, log.timerId);

  const timerRes = await getTimer(kv, log.timerId);

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

  return logs;
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
  const logKey = getLogKey(id);

  let res = { ok: false };

  while (!res.ok) {
    const logRes = await getLog(kv, id);

    if (logRes.value === null) return;

    const logByTimerKey = getLogByTimerKey(id, logRes.value.timerId);

    res = await kv.atomic()
      .check(logRes)
      .delete(logKey)
      .delete(logByTimerKey)
      .commit();
  }
}
