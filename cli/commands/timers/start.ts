import { Command } from "$cliffy/command/mod.ts";
import { getTopicBySlug } from "../../db/topics.ts";
import { newTimer, startTimer } from "../../timers.ts";
import { parseDuration } from "../../utils.ts";

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
    const topic = options.topic
      ? await getTopicBySlug(options.topic)
      : undefined;

    if (options.topic && !topic?.value) {
      console.error(`Topic with slug '${options.topic}' was not found`);
      return;
    }

    const duration = parseDuration(options.duration);

    if (!duration) {
      console.error(
        `Duration can't be parsed. Valid format is {integer}[ms|s|m|h].`,
      );
      return;
    }

    const timer = newTimer(options.name, duration, topic?.value?.id);

    await startTimer(timer);

    console.log(`Timer "${timer.id}" started.`);
  });
