import { Command } from "@cliffy/command";
import { colors } from "@cliffy/ansi/colors";
import { getDatabaseConnection } from "../../db.ts";
import { insertTemplate } from "../../db/templates.ts";
import { getTopicBySlug } from "../../db/topics.ts";
import { newTemplate } from "../../templates.ts";
import { parseDuration } from "../../utils.ts";

export const command = new Command()
  .option("-n, --name <name:string>", "The name of the template.", {
    required: true,
  })
  .option("-d, --duration <duration:string>", "The duration of the timer.", {
    required: true,
  })
  .option(
    "--topic <topic:string>",
    "The topic slug to which the template belongs.",
  )
  .description("Creates a new template.")
  .action(async (options) => {
    const kv = await getDatabaseConnection();

    const topic = options.topic
      ? await getTopicBySlug(kv, options.topic)
      : undefined;

    if (options.topic && !topic?.value) {
      console.error(colors.red(`Topic with slug '${options.topic}' not found`));

      Deno.exit(1);
    }

    const duration = parseDuration(options.duration);

    if (!duration) {
      console.error(
        colors.red(
          `Duration can't be parsed. Valid format is {integer}[ms|s|m|h].`,
        ),
      );

      Deno.exit(1);
    }

    const template = newTemplate(options.name, duration, topic?.value?.id);

    const { ok } = await insertTemplate(kv, template);

    if (!ok) {
      console.log(colors.red(`Template "${template.name}" already exists.`));

      Deno.exit(1);
    }

    console.log(colors.green(`Template "${template.name}" created.`));
  });
