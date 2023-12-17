import {
  destroyTopic,
  getTopic,
  getTopics,
  newTopic,
  storeTopic,
} from "../db/topics.ts";

export async function createTopic(name: string | undefined): Promise<void> {
  if (!name) {
    console.error("Argument `--name=` is required.");

    return;
  }

  const topicTmp = newTopic(name);

  try {
    const topic = await storeTopic(topicTmp);
    console.log(`Topic "${topic.name}" created.`);
  } catch (_) {
    console.log(`Topic "${topicTmp.name}" already exists.`);
  }
}

export async function listTopics(): Promise<void> {
  const topics = await getTopics();

  console.log(topics);
}

export async function deleteTopic(slug: string | undefined): Promise<void> {
  if (!slug) {
    console.error("Third argument 'slug' is required.");

    return;
  }

  const topicRes = await getTopic(slug);

  if (!topicRes) {
    console.log(`No topic with slug ${slug} found.`);
    return;
  }

  await destroyTopic(slug);

  console.log(`Topic "${slug}" deleted.`);
}
