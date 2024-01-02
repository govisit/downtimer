import { Command } from "$cliffy/command/mod.ts";
import { insertTemplate } from "../../db/templates.ts";
import { getTopicBySlug } from "../../db/topics.ts";
import { newTemplate } from "../../templates.ts";

export const command = new Command()
  .option("-n, --name <name:string>", "The name of the template.", {
    required: true,
  })
  .option("-d, --duration <duration:number>", "The duration of the timer.", {
    required: true,
  })
  .option(
    "--topic <topic:string>",
    "The topic slug to which the template belongs.",
  )
  .description("It creates a new template.")
  .action(async (options) => {
    const topicSlug = options.topic;

    if (topicSlug) {
      const topic = await getTopicBySlug(topicSlug);

      if (!topic.value) {
        console.error(`Topic with slug '${topicSlug}' not found`);
        return;
      }
    }

    const template = newTemplate(options.name, options.duration, options.topic);

    const { ok } = await insertTemplate(template);

    if (!ok) {
      console.log(`Template "${template.name}" already exists.`);
      return;
    }

    console.log(`Template "${template.name}" created.`);
  });
