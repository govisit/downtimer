import { Command } from "$cliffy/command/mod.ts";
import { colors } from "$cliffy/ansi/colors.ts";
import { getDatabaseConnection } from "../../db.ts";
import { getTimer } from "../../db/timers.ts";
import { manualCompleteTimer } from "../../timers.ts";

export const command = new Command()
  .arguments("<id:string>")
  .description("Completes a timer (manually).")
  .action(async (_, id) => {
    const kv = await getDatabaseConnection();

    const { value: timer } = await getTimer(kv, id);

    if (!timer) {
      console.log(colors.red(`No timer with id ${id} found.`));

      Deno.exit(1);
    }

    await manualCompleteTimer(kv, timer);

    console.log(
      colors.green(`Timer "${timer.name}" (${id}) was manually completed.`),
    );
  });
