import { Command } from "$cliffy/command/mod.ts";
import { getTopicBySlug } from "../../db/topics.ts";
import { newTimer, parseDuration, startTimer } from "../../timers.ts";

export const command = new Command()
  .option("-n, --name <name:string>", "The name of the timer.", {
    required: true,
  })
  .option("-d, --duration <duration:string>", "The duration of the timer.", {
    required: true,
  })
  .option(
    "-t, --topic <topic:string>",
    "The topic slug to which the timer belongs.",
  )
  .description("It starts a new timer.")
  .action(async (options) => {
    const topicSlug = options.topic;

    if (topicSlug) {
      const topic = await getTopicBySlug(topicSlug);

      if (!topic.value) {
        console.error(`Topic with slug '${topicSlug}' not found`);
        return;
      }
    }

    const duration = parseDuration(options.duration);

    if (!duration) {
      console.error(
        `Duration can't be parsed. Valid format is {integer}[ms|s|m|h].`,
      );
      return;
    }

    const timer = newTimer(options.name, duration, options.topic);

    await startTimer(timer);

    console.log(`Timer "${timer.id}" started.`);
  });
