import { Command } from "$cliffy/command/mod.ts";
import { getTimer } from "../../db/timers.ts";
import { pauseTimer } from "../../timers.ts";

export const command = new Command()
  .arguments("<id:string>")
  .description("It pauses a timer.")
  .action(async (_, id) => {
    const { value: timer } = await getTimer(id);

    if (!timer) {
      console.log(`No timer with id ${id} found.`);
      return;
    }

    await pauseTimer(timer.id);

    console.log(`Timer "${timer.name}" (${id}) was paused.`);
  });
