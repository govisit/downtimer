import { assertEquals, assertExists, assertRejects } from "@std/assert";
import { DatabasePurpose } from "../db.ts";
import { databaseCleanup, getDatabaseConnection } from "../db.ts";
import { createTemplate } from "../templates.ts";
import { newTimer, startTimer } from "../timers.ts";
import { createTopic } from "../topics.ts";
import { deleteTemplate } from "./templates.ts";
import { deleteTimer } from "./timers.ts";
import { deleteTopic, getTopic, getTopicBySlug, getTopics } from "./topics.ts";

const kv = await getDatabaseConnection(DatabasePurpose.Testing);

Deno.test("it should get topics from the db", async (t) => {
  await databaseCleanup(kv);

  await t.step("when the database is empty", async () => {
    assertEquals(await getTopics(kv), []);
  });

  await t.step("when the database has one topic", async () => {
    await createTopic(kv, "test");

    assertEquals((await getTopics(kv)).length, 1);
  });
});

Deno.test("it should insert a topic in db", async (t) => {
  await databaseCleanup(kv);

  await t.step("can insert topic", async () => {
    const [ok] = await createTopic(kv, "test");

    assertEquals(ok, true);
  });

  await t.step("can't insert duplicate topic", async () => {
    const [ok] = await createTopic(kv, "test");

    assertEquals(ok, false);
  });
});

Deno.test("it should get a single topic", async (t) => {
  await databaseCleanup(kv);

  const [_, topic] = await createTopic(kv, "test");

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
  await databaseCleanup(kv);

  const [_, topic] = await createTopic(kv, "test");

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

Deno.test("when deleting a topic", async (t) => {
  await databaseCleanup(kv);

  const [_, topic] = await createTopic(kv, "test");

  await t.step("it should fail when there are associated timers", async () => {
    const timer = newTimer("test", 6000, topic.id);

    await startTimer(kv, timer);

    await assertRejects(
      async () => {
        await deleteTopic(kv, topic.id);
      },
      Error,
      "You must delete the associated timers first.",
    );

    await deleteTimer(kv, timer.id);
  });

  await t.step(
    "it should fail when there are associated templates",
    async () => {
      const [_, template] = await createTemplate(kv, "test", 6000, topic.id);

      await assertRejects(
        async () => {
          await deleteTopic(kv, topic.id);
        },
        Error,
        "You must delete the associated templates first.",
      );

      await deleteTemplate(kv, template.id);
    },
  );
});
