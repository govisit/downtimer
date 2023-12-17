import { generateId, kv } from "../db.ts";
import { Timer } from "../../shared/types.ts";
import { destroyLog, getLogsforTimer } from "./logs.ts";

export function newTimer(
  name: string,
  duration: number,
  topic: string | undefined,
  template: string | undefined,
): Timer {
  return {
    id: generateId(),
    name: name,
    duration: duration,
    topicId: topic,
    templateId: template,
  };
}

export async function storeTimer(timer: Timer): Promise<Timer> {
  const timerKey = ["timers", timer.id];

  const { ok } = await kv.atomic().check({
    key: timerKey,
    versionstamp: null,
  })
    .set(timerKey, timer).commit();

  if (!ok) {
    throw new Error(`Timer "${timer.name}" already exists.`);
  }

  return timer;
}

export async function getTimers(): Promise<Timer[]> {
  const timers: Timer[] = [];

  for await (const res of kv.list<Timer>({ prefix: ["timers"] })) {
    timers.push(res.value);
  }

  return timers;
}

export async function getTimer(id: string): Promise<Timer | null> {
  const key = ["timers", id];

  return (await kv.get<Timer>(key)).value;
}

export async function destroyTimer(
  id: string,
): Promise<void> {
  const timerKey = ["timers", id];

  const logs = await getLogsforTimer(id);

  for (const log of logs) {
    await destroyLog(log.id);
  }

  await kv.delete(timerKey);
}
