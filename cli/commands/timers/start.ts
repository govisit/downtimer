import { Command } from "@cliffy/command";
import { colors } from "@cliffy/ansi";
import { getDatabaseConnection } from "../../db.ts";
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
  .description("Starts a new timer.")
  .action(async (options) => {
    const kv = await getDatabaseConnection();

    const topic = options.topic
      ? await getTopicBySlug(kv, options.topic)
      : undefined;

    if (options.topic && !topic?.value) {
      console.error(
        colors.red(`Topic with slug '${options.topic}' was not found`),
      );

      Deno.exit(1);
    }

    const duration = parseDuration(options.duration);

    if (!duration) {
      console.error(colors.red(
        `Duration can't be parsed. Valid format is {integer}[ms|s|m|h].`,
      ));

      Deno.exit(1);
    }

    const timer = newTimer(options.name, duration, topic?.value?.id);

    await startTimer(kv, timer);

    console.log(colors.green(`Timer "${timer.id}" started.`));
  });
