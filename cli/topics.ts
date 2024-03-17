import { slug } from "slug";
import { Topic } from "../shared/types.ts";
import { generateId } from "./utils.ts";
import { insertTopic } from "./db/topics.ts";

export function newTopic(name: string, createdAt?: number): Topic {
  return {
    id: generateId(),
    name: name,
    slug: slug(name),
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
