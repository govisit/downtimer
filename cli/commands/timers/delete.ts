import { Command } from "$cliffy/command/mod.ts";
import { colors } from "$cliffy/ansi/colors.ts";
import { getDatabaseConnection } from "../../db.ts";
import { deleteTimer, getTimer } from "../../db/timers.ts";

export const command = new Command()
  .arguments("<id:string>")
  .description("It deletes a timer.")
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
