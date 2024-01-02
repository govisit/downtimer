import { Command } from "$cliffy/command/mod.ts";
import { getTemplate } from "../../db/templates.ts";
import { getTopic } from "../../db/topics.ts";
import { newTimerFromTemplate, startTimer } from "../../timers.ts";

export const command = new Command()
  .arguments("<template:string>")
  .option("-n, --name <name:string>", "Override the name of the timer.")
  .option(
    "-d, --duration <duration:number>",
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
    const template = await getTemplate(templateId);

    if (!template.value) {
      console.error(`Template with ID '${templateId}' was not found`);
      return;
    }

    const topicSlug = options.topic;

    if (topicSlug) {
      const topic = await getTopic(topicSlug);

      if (!topic.value) {
        console.error(`Topic with slug '${topicSlug}' was not found`);
        return;
      }

      // NOTE: Mutates value.
      options.topic = topic.value.id;
    }

    const timer = newTimerFromTemplate(template.value, options);

    await startTimer(timer);

    console.log(`Timer "${timer.id}" started.`);
  });
