import { Command } from "@cliffy/command";
import { colors } from "@cliffy/ansi/colors";
import { getDatabaseConnection } from "../../db.ts";
import { deleteTimer, getTimer } from "../../db/timers.ts";

export const command = new Command()
  .arguments("<id:string>")
  .description("Deletes a timer.")
  .action(async (_, id) => {
    const kv = await getDatabaseConnection();

    const { value: timer } = await getTimer(kv, id);

    if (!timer) {
      console.log(colors.red(`No timer with id ${id} found.`));

      Deno.exit(1);
    }

    await deleteTimer(kv, timer.id);

    console.log(colors.green(`Timer "${timer.name}" (${id}) deleted.`));
  });
