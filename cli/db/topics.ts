import { kv } from "../db.ts";
import { Topic } from "../../shared/types.ts";
import { slug } from "https://deno.land/x/slug@v1.1.0/mod.ts";

export function newTopic(name: string): Topic {
  return {
    name: name,
    slug: slug(name),
    createdAt: new Date(),
  };
}

export async function storeTopic(topic: Topic): Promise<Topic> {
  const topicKey = ["topics", topic.slug];

  const { ok } = await kv.atomic().check({ key: topicKey, versionstamp: null })
    .set(
      topicKey,
      topic,
    ).commit();

  if (!ok) {
    throw new Error(`Topic "${topic.name}" already exists.`);
  }

  return topic;
}

export async function getTopics(): Promise<Topic[]> {
  const topics: Topic[] = [];

  for await (const res of kv.list<Topic>({ prefix: ["topics"] })) {
    topics.push(res.value);
  }

  return topics;
}

export async function getTopic(slug: string): Promise<Topic | null> {
  const key = ["topics", slug];

  return (await kv.get<Topic>(key)).value!;
}

export async function destroyTopic(
  slug: string,
): Promise<void> {
  const topicKey = ["topics", slug];

  await kv.delete(topicKey);
}
