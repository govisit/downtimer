import { assertEquals, assertExists, assertRejects } from "$std/assert/mod.ts";
import { decodeTime } from "$std/ulid/mod.ts";
import {
  databaseCleanup,
  DatabasePurpose,
  getDatabaseConnection,
} from "./db.ts";
import { deleteTemplate } from "./db/templates.ts";
import { deleteTimer } from "./db/timers.ts";
import {
  deleteTopic,
  getTopic,
  getTopicBySlug,
  getTopics,
} from "./db/topics.ts";
import { createTemplate } from "./templates.ts";
import {
  calcCompletedAtTime,
  completeTimer,
  getElapsedTime,
  newTimer,
  startTimer,
} from "./timers.ts";
import { createTopic } from "./topics.ts";

const kv = await getDatabaseConnection(DatabasePurpose.Testing);

Deno.test("it should calculate correct completed at time", async (t) => {
  await databaseCleanup(kv);

  const timer = newTimer("test", 6000);

  const { timer: timer1, log: startedLog } = await startTimer(kv, timer);
  const now = Date.now();

  const completedAt = now + timer1.duration + 6000;

  console.log({ completedAt }, completedAt - decodeTime(startedLog.id));

  const completedLog = await completeTimer(
    kv,
    timer1,
    completedAt,
  );

  console.log({ completedLog });

  const elapsedTime = getElapsedTime(timer1, [startedLog, completedLog]);

  assertEquals(elapsedTime, 12000);

  // assertEquals(calcCompletedAtTime(elapsedTime, timer1), );
});

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
