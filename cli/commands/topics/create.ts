import { Command } from "$cliffy/command/mod.ts";
import { colors } from "$cliffy/ansi/colors.ts";
import { getDatabaseConnection } from "../../db.ts";
import { createTopic } from "../../topics.ts";

export const command = new Command()
  .option("-n, --name <name:string>", "The name of the topic.", {
    required: true,
  })
  .description("Creates a new topic.")
  .action(async (options) => {
    const kv = await getDatabaseConnection();

    const [ok, topic] = await createTopic(kv, options.name);

    if (!ok) {
      console.log(
        colors.red(`Topic "${topic.name}" already exists.`),
      );

      Deno.exit(1);
    }

    console.log(colors.green(`Topic "${topic.name}" created.`));
  });
