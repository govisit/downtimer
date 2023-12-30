import { kv } from "../db.ts";
import { Topic } from "../../shared/types.ts";

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

    res = await kv.atomic()
      .check(topicRes)
      .delete(topicKey)
      .delete(topicBySlugKey)
      .commit();
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
