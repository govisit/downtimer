import { Command } from "@cliffy/command";
import { colors } from "@cliffy/ansi/colors";
import { getDatabaseConnection } from "../../db.ts";
import { deleteTimer, getTimer } from "../../db/timers.ts";
import { getAllTimers, getCompletedTimers } from "../../timers.ts";
import { Confirm } from "@cliffy/prompt";

export const command = new Command()
  .arguments("[id:string]")
  .description("Deletes a timer, or all completed timers.")
  .option("-a, --all", "CAUTION: Deletes all timers including paused/active.")
  .action(async (options, id) => {
    const kv = await getDatabaseConnection();

    if (id) {
      const { value: timer } = await getTimer(kv, id);

      if (!timer) {
        console.log(colors.red(`No timer with id ${id} found.`));

        Deno.exit(1);
      }

      await deleteTimer(kv, timer.id);

      console.log(colors.green(`Timer "${timer.name}" (${id}) deleted.`));

      return;
    }

    if (options.all) {
      const confirmed = await Confirm.prompt(
        "Are you sure that you want to delete all timers?",
      );

      if (!confirmed) {
        console.info("Aborted.");

        Deno.exit(0);
      }

      const timers = await getAllTimers(kv);

      await Promise.all(timers.map((timer) => deleteTimer(kv, timer.id)));

      console.log(colors.green("All timers deleted."));

      return;
    }

    const confirmed = await Confirm.prompt(
      "Are you sure that you want to delete all completed timers?",
    );

    if (!confirmed) {
      console.info("Aborted.");

      Deno.exit(0);
    }

    const timers = await getCompletedTimers(kv);

    await Promise.all(timers.map((timer) => deleteTimer(kv, timer.id)));

    console.log(colors.green("All completed timers deleted."));
  });
