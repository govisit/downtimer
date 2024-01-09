import { kv } from "../db.ts";
import { Template, Timer, Topic } from "../../shared/types.ts";
import {
  getTimerByTemplateKey,
  getTimerByTopicKey,
  getTimerKey,
  getTimersByTopic,
} from "./timers.ts";
import {
  getTemplateByTopicKey,
  getTemplateKey,
  getTemplatesByTopic,
} from "./templates.ts";

const TOPIC_PREFIX = "topics";
const TOPIC_BY_SLUG_PREFIX = "topics_by_slug";

const getTopicKey = (id: string): string[] => [TOPIC_PREFIX, id];

const getTopicBySlugKey = (
  slug: string,
): string[] => [TOPIC_BY_SLUG_PREFIX, slug];

export async function getTopics(): Promise<Topic[]> {
  const topics: Topic[] = [];

  for await (const res of kv.list<Topic>({ prefix: [TOPIC_PREFIX] })) {
    topics.push(res.value);
  }

  return topics;
}

export async function insertTopic(
  topic: Topic,
): Promise<Deno.KvCommitResult | Deno.KvCommitError> {
  const topicKey = getTopicKey(topic.id);
  const topicBySlugKey = getTopicBySlugKey(topic.slug);

  return await kv
    .atomic()
    .check({ key: topicKey, versionstamp: null })
    .check({ key: topicBySlugKey, versionstamp: null })
    .set(topicKey, topic)
    .set(topicBySlugKey, topic)
    .commit();
}

export async function deleteTopic(id: string): Promise<void> {
  const topicKey = getTopicKey(id);

  let res = { ok: false };

  while (!res.ok) {
    const topicRes = await getTopic(id);

    if (topicRes.value === null) return;

    const topicBySlugKey = getTopicBySlugKey(topicRes.value.slug);

    const operation = kv
      .atomic()
      .check(topicRes)
      .delete(topicKey)
      .delete(topicBySlugKey);

    const timers = await getTimersByTopic(id);

    for (const timer of timers) {
      const timerByTopicKey = getTimerByTopicKey(timer.id, id);
      const timerKey = getTimerKey(timer.id);

      const updatedTimer: Timer = { ...timer, topicId: undefined };

      if (timer.templateId) {
        const timerByTemplateKey = getTimerByTemplateKey(
          timer.id,
          timer.templateId,
        );

        operation.set(timerByTemplateKey, updatedTimer);
      }

      operation
        .delete(timerByTopicKey)
        .set(timerKey, updatedTimer);
    }

    const templates = await getTemplatesByTopic(id);

    for (const template of templates) {
      const templateByTopicKey = getTemplateByTopicKey(template.id, id);
      const templateKey = getTemplateKey(template.id);

      const updatedTemplate: Template = { ...template, topicId: undefined };

      operation
        .delete(templateByTopicKey)
        .set(templateKey, updatedTemplate);
    }

    res = await operation.commit();
  }
}

export async function getTopic(
  id: string,
): Promise<Deno.KvEntryMaybe<Topic>> {
  const key = getTopicKey(id);

  return (await kv.get<Topic>(key));
}

export async function getTopicBySlug(
  slug: string,
): Promise<Deno.KvEntryMaybe<Topic>> {
  const key = getTopicBySlugKey(slug);

  return (await kv.get<Topic>(key));
}
