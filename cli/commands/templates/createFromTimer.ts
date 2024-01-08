import { Command } from "$cliffy/command/mod.ts";
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
    "It creates a new template from a timer. You can override timer values.",
  )
  .action(async (options, timerId) => {
    const timer = await getTimer(timerId);

    if (!timer.value) {
      console.error(`Timer with ID '${timerId}' was not found`);
      return;
    }

    const topic = options.topic
      ? await getTopicBySlug(options.topic)
      : undefined;

    if (options.topic && !topic?.value) {
      console.error(`Topic with slug '${options.topic}' was not found`);
      return;
    }

    const duration = options.duration
      ? parseDuration(options.duration)
      : undefined;

    if (options.duration && !duration) {
      console.error(
        `Duration can't be parsed. Valid format is {integer}[ms|s|m|h].`,
      );
      return;
    }

    const overrides: Overrides = getTemplateOverrides(
      options.name,
      duration,
      topic?.value?.id,
    );

    const template = newTemplateFromTimer(timer.value, overrides);

    await insertTemplate(template);

    console.log(`Template "${template.name}" created.`);
  });
