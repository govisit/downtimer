import { Command } from "$cliffy/command/mod.ts";
import { getDatabaseConnection } from "../../db.ts";
import { deleteTimer, getTimer } from "../../db/timers.ts";

export const command = new Command()
  .arguments("<id:string>")
  .description("It deletes a timer.")
  .action(async (_, id) => {
    const kv = await getDatabaseConnection();

    const { value: timer } = await getTimer(kv, id);

    if (!timer) {
      console.log(`No timer with id ${id} found.`);
      return;
    }

    await deleteTimer(kv, timer.id);

    console.log(`Timer "${timer.name}" (${id}) deleted.`);
  });
