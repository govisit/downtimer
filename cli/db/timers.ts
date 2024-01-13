import { Timer } from "../../shared/types.ts";
import { getLogByTimerKey, getLogKey, getLogsByTimer } from "./logs.ts";

const TIMER_PREFIX = "timers";
const TIMER_TOPIC_PREFIX = "timers_by_topic";
const TIMER_TEMPLATE_PREFIX = "timers_by_template";

export const getTimerKey = (
  id: string,
): string[] => [TIMER_PREFIX, id];

export const getTimerByTopicKey = (
  id: string,
  topicId: string,
): string[] => [TIMER_TOPIC_PREFIX, topicId, id];

export const getTimerByTemplateKey = (
  id: string,
  templateId: string,
): string[] => [TIMER_TEMPLATE_PREFIX, templateId, id];

export async function insertTimer(
  kv: Deno.Kv,
  timer: Timer,
): Promise<Deno.KvCommitResult | Deno.KvCommitError> {
  const timerKey = getTimerKey(timer.id);

  const operation: Deno.AtomicOperation = kv
    .atomic()
    .check({ key: timerKey, versionstamp: null })
    .set(timerKey, timer);

  if (timer.topicId) {
    const timerByTopicKey = getTimerByTopicKey(timer.id, timer.topicId);

    operation.set(timerByTopicKey, timer);
  }

  if (timer.templateId) {
    const timerByTemplateKey = getTimerByTemplateKey(
      timer.id,
      timer.templateId,
    );

    operation.set(timerByTemplateKey, timer);
  }

  return await operation.commit();
}

export async function getTimers(
  kv: Deno.Kv,
): Promise<Timer[]> {
  const timers: Timer[] = [];

  for await (const res of kv.list<Timer>({ prefix: [TIMER_PREFIX] })) {
    timers.push(res.value);
  }

  return timers;
}

export async function getTimersByTopic(
  kv: Deno.Kv,
  topicId: string,
): Promise<Timer[]> {
  const timers: Timer[] = [];

  for await (
    const res of kv.list<Timer>({ prefix: [TIMER_TOPIC_PREFIX, topicId] })
  ) {
    timers.push(res.value);
  }

  return timers;
}

export async function getTimersByTemplate(
  kv: Deno.Kv,
  templateId: string,
): Promise<Timer[]> {
  const timers: Timer[] = [];

  for await (
    const res of kv.list<Timer>({ prefix: [TIMER_TEMPLATE_PREFIX, templateId] })
  ) {
    timers.push(res.value);
  }

  return timers;
}

export async function getTimer(
  kv: Deno.Kv,
  id: string,
): Promise<Deno.KvEntryMaybe<Timer>> {
  const key = getTimerKey(id);

  return (await kv.get<Timer>(key));
}

export async function deleteTimer(
  kv: Deno.Kv,
  id: string,
): Promise<void> {
  const timerKey = getTimerKey(id);

  let res = { ok: false };

  while (!res.ok) {
    const timerRes = await getTimer(kv, id);

    if (timerRes.value === null) return;

    const operation = kv
      .atomic()
      .check(timerRes)
      .delete(timerKey);

    if (timerRes.value.topicId) {
      const timerByTopicKey = getTimerByTopicKey(id, timerRes.value.topicId);

      operation.delete(timerByTopicKey);
    }

    if (timerRes.value.templateId) {
      const timerByTemplateKey = getTimerByTemplateKey(
        id,
        timerRes.value.templateId,
      );

      operation.delete(timerByTemplateKey);
    }

    const logs = await getLogsByTimer(kv, id);

    for (const log of logs) {
      const logKey = getLogKey(log.id);
      const logByTimerKey = getLogByTimerKey(log.id, log.timerId);

      operation.delete(logKey).delete(logByTimerKey);
    }

    res = await operation.commit();
  }
}
