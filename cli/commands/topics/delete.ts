import { Command } from "$cliffy/command/mod.ts";
import { colors } from "$cliffy/ansi/colors.ts";
import { getDatabaseConnection } from "../../db.ts";
import { deleteTopic, getTopicBySlug } from "../../db/topics.ts";

export const command = new Command()
  .arguments("<slug:string>")
  .description("Deletes a topic.")
  .action(async (_, slug) => {
    const kv = await getDatabaseConnection();

    const { value: topic } = await getTopicBySlug(kv, slug);

    if (!topic) {
      console.log(colors.red(`No topic with slug ${slug} found.`));

      Deno.exit(1);
    }

    try {
      await deleteTopic(kv, topic.id);
    } catch (error) {
      console.error(colors.red(error.message));

      Deno.exit(1);
    }

    console.log(colors.green(`Topic "${slug}" deleted.`));
  });
