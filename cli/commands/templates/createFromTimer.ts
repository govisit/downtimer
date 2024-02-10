import { Command } from "$cliffy/command/mod.ts";
import { colors } from "$cliffy/ansi/colors.ts";
import { getDatabaseConnection } from "../../db.ts";
import { insertTemplate } from "../../db/templates.ts";
import { getTimer } from "../../db/timers.ts";
import { getTopicBySlug } from "../../db/topics.ts";
import { newTemplateFromTimer } from "../../templates.ts";

import { getTemplateOverrides, Overrides } from "../../timers.ts";
import { parseDuration } from "../../utils.ts";

export const command = new Command()
  .option("-n, --name <name:string>", "The name of the template.")
  .option("-d, --duration <duration:string>", "The duration of the timer.")
  .option(
    "--topic <topic:string>",
    "The topic slug to which the template belongs.",
  )
  .arguments("<timerId:string>")
  .description(
    "Creates a new template from a timer. You can override timer values.",
  )
  .action(async (options, timerId) => {
    const kv = await getDatabaseConnection();

    const timer = await getTimer(kv, timerId);

    if (!timer.value) {
      console.error(colors.red(`Timer with ID '${timerId}' was not found`));

      Deno.exit(1);
    }

    const topic = options.topic
      ? await getTopicBySlug(kv, options.topic)
      : undefined;

    if (options.topic && !topic?.value) {
      console.error(
        colors.red(`Topic with slug '${options.topic}' was not found`),
      );

      Deno.exit(1);
    }

    const duration = options.duration
      ? parseDuration(options.duration)
      : undefined;

    if (options.duration && !duration) {
      console.error(
        colors.red(
          `Duration can't be parsed. Valid format is {integer}[ms|s|m|h].`,
        ),
      );

      Deno.exit(1);
    }

    const overrides: Overrides = getTemplateOverrides(
      options.name,
      duration,
      topic?.value?.id,
    );

    const template = newTemplateFromTimer(timer.value, overrides);

    await insertTemplate(kv, template);

    console.log(colors.green(`Template "${template.name}" created.`));
  });
