import { assertEquals, assertExists } from "$std/assert/mod.ts";
import { Topic } from "../../shared/types.ts";
import { getDatabaseConnection } from "../db.ts";
import { newTopic } from "../topics.ts";
import {
  deleteTopic,
  getTopic,
  getTopicBySlug,
  getTopics,
  insertTopic,
} from "./topics.ts";

const kv = await getDatabaseConnection("test.db");

async function databaseCleanup() {
  for await (const res of kv.list({ prefix: [] })) {
    await kv.delete(res.key);
  }
}

async function insertDummyTopic(
  name: string,
): Promise<readonly [boolean, Topic]> {
  const topic = newTopic(name);

  const { ok } = await insertTopic(kv, topic);

  return [ok, topic];
}

Deno.test("it should get topics from the db", async (t) => {
  await databaseCleanup();

  await t.step("when the database is empty", async () => {
    assertEquals(await getTopics(kv), []);
  });

  await t.step("when the database has one topic", async () => {
    await insertDummyTopic("test");

    assertEquals((await getTopics(kv)).length, 1);
  });
});

Deno.test("it should insert a topic in db", async (t) => {
  await databaseCleanup();

  await t.step("can insert topic", async () => {
    const [ok] = await insertDummyTopic("test");

    assertEquals(ok, true);
  });

  await t.step("can't insert duplicate topic", async () => {
    const [ok] = await insertDummyTopic("test");

    assertEquals(ok, false);
  });
});

Deno.test("it should get a single topic", async (t) => {
  await databaseCleanup();

  const [_, topic] = await insertDummyTopic("test");

  await t.step("by Id", async () => {
    const topicRes = await getTopic(kv, topic.id);

    assertExists(topicRes.value);
  });

  await t.step("by slug", async () => {
    const topicRes = await getTopicBySlug(kv, topic.slug);

    assertExists(topicRes.value);
  });
});

Deno.test("it should delete a topic", async (t) => {
  await databaseCleanup();

  const [_, topic] = await insertDummyTopic("test");

  await t.step("when a topic exists", async () => {
    await deleteTopic(kv, topic.id);

    const topicRes = await getTopic(kv, topic.id);

    assertEquals(topicRes.value, null);
  });

  await t.step("when a topic does not exist", async () => {
    await deleteTopic(kv, topic.id);

    const topicRes = await getTopicBySlug(kv, topic.slug);

    assertEquals(topicRes.value, null);
  });
});
