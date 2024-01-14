import { Topic } from "../../shared/types.ts";
import { getTimersByTopic } from "./timers.ts";
import { getTemplatesByTopic } from "./templates.ts";

const TOPIC_PREFIX = "topics";
const TOPIC_BY_SLUG_PREFIX = "topics_by_slug";

const getTopicKey = (id: string): string[] => [TOPIC_PREFIX, id];

const getTopicBySlugKey = (
  slug: string,
): string[] => [TOPIC_BY_SLUG_PREFIX, slug];

export async function getTopics(kv: Deno.Kv): Promise<Topic[]> {
  const topics: Topic[] = [];

  for await (const res of kv.list<Topic>({ prefix: [TOPIC_PREFIX] })) {
    topics.push(res.value);
  }

  return topics;
}

export async function insertTopic(
  kv: Deno.Kv,
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

/**
 * @throws {Error} When there are associated timers or templates.
 */
export async function deleteTopic(kv: Deno.Kv, id: string): Promise<void> {
  const associatedTimers = await getTimersByTopic(kv, id);

  if (associatedTimers.length) {
    throw new Error("You must delete the associated timers first.");
  }

  const associatedTemplates = await getTemplatesByTopic(kv, id);

  if (associatedTemplates.length) {
    throw new Error("You must delete the associated templates first.");
  }

  const topic = await getTopic(kv, id);

  if (topic.value === null) return;

  const operation = kv.atomic();

  const topicBySlugKey = getTopicBySlugKey(topic.value.slug);

  operation.delete(topic.key).delete(topicBySlugKey);

  await operation.commit();
}

export async function getTopic(
  kv: Deno.Kv,
  id: string,
): Promise<Deno.KvEntryMaybe<Topic>> {
  const key = getTopicKey(id);

  return (await kv.get<Topic>(key));
}

export async function getTopicBySlug(
  kv: Deno.Kv,
  slug: string,
): Promise<Deno.KvEntryMaybe<Topic>> {
  const key = getTopicBySlugKey(slug);

  return (await kv.get<Topic>(key));
}
