import { generateId, kv } from "../db.ts";
import { Log, TimerStatus } from "../../shared/types.ts";

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

export async function storeLog(log: Log): Promise<void> {
  const timerKey = ["logs", log.id];
  const byTimerKey = ["logs_by_timers", log.timerId, log.id];

  const { ok } = await kv.atomic().check({
    key: timerKey,
    versionstamp: null,
  })
    .set(timerKey, log)
    .set(byTimerKey, log)
    .commit();

  if (!ok) {
    throw new Error(`Log "${log.id}" already exists.`);
  }
}

export async function getLogs(): Promise<Log[]> {
  const logs: Log[] = [];

  for await (const res of kv.list<Log>({ prefix: ["logs"] })) {
    logs.push(res.value);
  }

  return logs;
}

export async function getLogsforTimer(timerId: string): Promise<Log[]> {
  const logs: Log[] = [];

  for await (
    const res of kv.list<Log>({ prefix: ["logs_by_timers", timerId] })
  ) {
    logs.push(res.value);
  }

  return logs;
}

export async function getLog(id: string): Promise<Log | null> {
  const key = ["logs", id];

  return (await kv.get<Log>(key)).value;
}

export async function destroyLog(
  id: string,
): Promise<void> {
  let res = { ok: false };

  while (!res.ok) {
    const getRes = await kv.get<Log>(["logs", id]);

    if (getRes.value === null) return;

    res = await kv.atomic()
      .check(getRes)
      .delete(["logs", id])
      .delete(["logs_by_timers", getRes.value.timerId, id])
      .commit();
  }
}
