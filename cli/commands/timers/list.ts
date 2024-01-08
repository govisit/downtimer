import { Command } from "$cliffy/command/mod.ts";
import { Table } from "$cliffy/table/table.ts";
import {
  cron,
  getActiveTimers,
  getAllTimers,
  getTimeRemaining,
} from "../../timers.ts";
import { getPrettyDate, getPrettyDuration } from "../../utils.ts";

export const command = new Command()
  .description("Lists all active timers by default.")
  .option("-a, --all", "Set this option to show all timers.")
  .action(async (options) => {
    await cron();

    const timers = await (() => {
      if (options.all) {
        return getAllTimers();
      }

      return getActiveTimers();
    })();

    if (timers.length === 0) {
      console.log(
        "No timers.\nTry starting a new timer or using --all option to see all timers.",
      );

      return Deno.exit();
    }

    const table = new Table();

    const body = await Promise.all(timers.map(
      (
        timer,
      ) => {
        const timeRemaining = getTimeRemaining(timer);
        // console.log({ timeRemaining });

        return [
          timer.id,
          timer.name,
          getPrettyDuration(timer.duration),
          timer.status?.toString(),
          timer.topicId,
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
