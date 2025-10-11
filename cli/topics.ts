import { Slugify as slugify } from "@officialrajdeepsingh/slugify";
import type { Topic } from "./types.ts";
import { generateId } from "./utils.ts";
import { insertTopic } from "./db/topics.ts";

export function newTopic(name: string, createdAt?: number): Topic {
  return {
    id: generateId(),
    name: name,
    slug: slugify(name),
    createdAt: createdAt || Date.now(),
  };
}

export async function createTopic(
  kv: Deno.Kv,
  name: string,
): Promise<readonly [boolean, Topic]> {
  const topic = newTopic(name);

  const { ok } = await insertTopic(kv, topic);

  return [ok, topic];
}
