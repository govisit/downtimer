import { Command } from "@cliffy/command";
import { colors } from "@cliffy/ansi/colors";
import { getDatabaseConnection } from "../../db.ts";
import { getTimer } from "../../db/timers.ts";
import { pauseTimer } from "../../timers.ts";

export const command = new Command()
  .arguments("<id:string>")
  .description("Pauses a timer.")
  .action(async (_, id) => {
    const kv = await getDatabaseConnection();

    const { value: timer } = await getTimer(kv, id);

    if (!timer) {
      console.log(colors.red(`No timer with id ${id} found.`));

      Deno.exit(1);
    }

    await pauseTimer(kv, timer);

    console.log(colors.green(`Timer "${timer.name}" (${id}) was paused.`));
  });
