import { kv } from "../db.ts";
import { Topic } from "../../shared/types.ts";

export const TOPIC_PREFIX = "topics";

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
  const topicKey = getTopicKey(topic.slug);

  return await kv
    .atomic()
    .check({ key: topicKey, versionstamp: null })
    .set(topicKey, topic)
    .commit();
}

const getTopicKey = (slug: string): string[] => [TOPIC_PREFIX, slug];

export async function deleteTopic(slug: string): Promise<void> {
  const topicKey = getTopicKey(slug);

  await kv.delete(topicKey);
}

export async function getTopic(slug: string): Promise<Topic | null> {
  const topicKey = getTopicKey(slug);

  return (await kv.get<Topic>(topicKey)).value;
}
