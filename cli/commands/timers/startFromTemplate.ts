import { Command } from "$cliffy/command/mod.ts";
import { getDatabaseConnection } from "../../db.ts";
import { getTemplate } from "../../db/templates.ts";
import { getTopicBySlug } from "../../db/topics.ts";
import {
  getTemplateOverrides,
  newTimerFromTemplate,
  Overrides,
  startTimer,
} from "../../timers.ts";
import { parseDuration } from "../../utils.ts";

export const command = new Command()
  .arguments("<templateId:string>")
  .option("-n, --name <name:string>", "Override the name of the timer.")
  .option(
    "-d, --duration <duration:string>",
    "Override the duration of the timer.",
  )
  .option(
    "-t, --topic <topic:string>",
    "Override the topic to which the timer belongs.",
  )
  .description(
    "It starts a new timer using a template. You can override template values.",
  )
  .action(async (options, templateId) => {
    const kv = await getDatabaseConnection();

    const template = await getTemplate(kv, templateId);

    if (!template.value) {
      console.error(`Template with ID '${templateId}' was not found`);
      return;
    }

    const topic = options.topic
      ? await getTopicBySlug(kv, options.topic)
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

    const timer = newTimerFromTemplate(template.value, overrides);

    await startTimer(kv, timer);

    console.log(`Timer "${timer.id}" started.`);
  });
