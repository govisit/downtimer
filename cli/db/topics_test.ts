import { assertEquals } from "$std/assert/mod.ts";
import { getDatabaseConnection } from "../db.ts";
import { newTopic } from "../topics.ts";
import { getTopics, insertTopic } from "./topics.ts";

const kv = await getDatabaseConnection("test.db");

async function insertDummyTopic(name: string): Promise<boolean> {
  const topic = newTopic(name);

  const { ok } = await insertTopic(kv, topic);

  return ok;
}

Deno.test("it should get topics from the db", async () => {
  assertEquals(await getTopics(kv), []);

  await insertDummyTopic("test");

  assertEquals((await getTopics(kv)).length, 1);
});

Deno.test("it should insert a topic in db", async () => {
  const ok = await insertDummyTopic("test");

  assertEquals(ok, true);
});
