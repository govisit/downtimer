import { Command } from "$cliffy/command/mod.ts";
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
  .description("It creates a new template.")
  .action(async (options) => {
    const kv = await getDatabaseConnection();

    const topic = options.topic
      ? await getTopicBySlug(kv, options.topic)
      : undefined;

    if (options.topic && !topic?.value) {
      console.error(`Topic with slug '${options.topic}' not found`);
      return;
    }

    const duration = parseDuration(options.duration);

    if (!duration) {
      console.error(
        `Duration can't be parsed. Valid format is {integer}[ms|s|m|h].`,
      );
      return;
    }

    const template = newTemplate(options.name, duration, topic?.value?.id);

    const { ok } = await insertTemplate(kv, template);

    if (!ok) {
      console.log(`Template "${template.name}" already exists.`);
      return;
    }

    console.log(`Template "${template.name}" created.`);
  });
