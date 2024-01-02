import { Command } from "$cliffy/command/mod.ts";
import { Table } from "$cliffy/table/table.ts";
import {
  cron,
  getActiveTimers,
  getAllTimers,
  getPrettyTimeRemaining,
  getTimeRemaining,
} from "../../timers.ts";

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
      async (
        timer,
      ) => {
        const timeRemaining = await getTimeRemaining(timer);

        return [
          timer.id,
          timer.name,
          timer.duration,
          timer.status?.toString(),
          timer.topicId,
          getPrettyTimeRemaining(timeRemaining),
        ];
      },
    ));

    table
      .header(["id", "name", "duration", "status", "topic", "remaining"])
      .body(body)
      .border()
      .render();
  });
