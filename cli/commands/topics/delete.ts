import { Command } from "$cliffy/command/mod.ts";
import { getDatabaseConnection } from "../../db.ts";
import { deleteTopic, getTopicBySlug } from "../../db/topics.ts";

export const command = new Command()
  .arguments("<slug:string>")
  .description("It deletes a topic.")
  .action(async (_, slug) => {
    const kv = await getDatabaseConnection();

    const { value: topic } = await getTopicBySlug(kv, slug);

    if (!topic) {
      console.log(`No topic with slug ${slug} found.`);
      return;
    }

    await deleteTopic(kv, topic.id);

    console.log(`Topic "${slug}" deleted.`);
  });
