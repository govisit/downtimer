import { Command } from "$cliffy/command/mod.ts";
import { deleteTopic, getTopic } from "../../db/topics.ts";

export const command = new Command()
  .arguments("<slug:string>")
  .description("It deletes a topic.")
  .action(async (_, args_0) => {
    const slug = args_0;

    const { value: topic }= await getTopic(slug);

    if (!topic) {
      console.log(`No topic with slug ${slug} found.`);
      return;
    }

    await deleteTopic(topic.slug);

    console.log(`Topic "${slug}" deleted.`);
  });
