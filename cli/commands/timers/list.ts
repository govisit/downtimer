import { Command } from "$cliffy/command/mod.ts";
import { Table } from "$cliffy/table/table.ts";
import { getDatabaseConnection } from "../../db.ts";
import { getTopic } from "../../db/topics.ts";
import {
  cron,
  getActiveTimers,
  getAllTimers,
  getTimeRemaining,
} from "../../timers.ts";
import { getPrettyDate, getPrettyDuration } from "../../utils.ts";
import { colors } from "$cliffy/ansi/colors.ts";

export const command = new Command()
  .description("Lists all active timers by default.")
  .option("-a, --all", "Set this option to show all timers.")
  .action(async (options) => {
    const kv = await getDatabaseConnection();

    await cron(kv);

    const timers = await (() => {
      if (options.all) {
        return getAllTimers(kv);
      }

      return getActiveTimers(kv);
    })();

    if (timers.length === 0) {
      console.log(
        colors.blue(
          "No timers.\nTry starting a new timer or using --all option to see all timers.",
        ),
      );

      Deno.exit(1);
    }

    const table = new Table();

    const body = await Promise.all(timers.map(
      async (
        timer,
      ) => {
        const timeRemaining = getTimeRemaining(timer);

        const topic = timer.topicId
          ? await getTopic(kv, timer.topicId)
          : undefined;

        return [
          timer.id,
          timer.name,
          getPrettyDuration(timer.duration),
          timer.status?.toString(),
          topic?.value?.slug,
          getPrettyDuration(timeRemaining),
          getPrettyDate(timer.id),
        ];
      },
    ));

    table
      .header([
        "Id",
        "Name",
        "Duration",
        "Status",
        "Topic",
        "Remaining",
        "Created at",
      ])
      .body(body)
      .border()
      .render();
  });
