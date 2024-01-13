import { Command } from "$cliffy/command/mod.ts";
import { getDatabaseConnection } from "../../db.ts";
import { getTimer } from "../../db/timers.ts";
import { pauseTimer } from "../../timers.ts";

export const command = new Command()
  .arguments("<id:string>")
  .description("It pauses a timer.")
  .action(async (_, id) => {
    const kv = await getDatabaseConnection();

    const { value: timer } = await getTimer(kv, id);

    if (!timer) {
      console.log(`No timer with id ${id} found.`);
      return;
    }

    await pauseTimer(kv, timer);

    console.log(`Timer "${timer.name}" (${id}) was paused.`);
  });
