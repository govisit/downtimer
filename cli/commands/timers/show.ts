import { Command } from "$cliffy/command/mod.ts";
import { colors } from "$cliffy/ansi/colors.ts";
import { getDatabaseConnection } from "../../db.ts";
import { getTimer } from "../../db/timers.ts";
import { tty } from "$cliffy/ansi/tty.ts";
import {
  handleInput,
  handleKeyboardControls,
  handleMouseControls,
  Tui,
} from "$tui/mod.ts";
import { Text } from "$tui/src/components/mod.ts";

export const command = new Command()
  .arguments("<id:string>")
  .option(
    "-c, --countdown",
    "Eye candy and real time monitoring.",
  )
  .description("It shows details about a specific timer.")
  .action(async (options, id) => {
    const kv = await getDatabaseConnection();

    const timer = await getTimer(kv, id);

    if (timer.value === null) {
      console.error(`Timer with Id '${id}' was not found.`);

      Deno.exit(1);
    }

    if (!options.countdown) {
      throw new Error("Not yet implemented");
    }

    const tui = new Tui({
      style: colors.bgBlack, // Make background black
      refreshRate: 1000 / 60, // Run in 60FPS
    });

    tty.clearScreen();

    tui.dispatch(); // Close Tui on CTRL+C

    handleInput(tui);
    handleMouseControls(tui);
    handleKeyboardControls(tui);

    // const { columns, rows } = Deno.consoleSize();

    const text = `
 _ _ _          _   _     _     
| (_) | _____  | |_| |__ (_)___ 
| | | |/ / _ \ | __| '_ \| / __|
| | |   <  __/ | |_| | | | \__ \
|_|_|_|\_\___|  \__|_| |_|_|___/
  `;

    new Text({
      parent: tui,
      text: text,
      theme: {
        base: colors.magenta,
      },
      rectangle: {
        get column(): number {
          return ~~(tui.canvas.size.value.columns / 2 - (this.width || 1) / 2);
        },
        get row(): number {
          // return ~~(tui.canvas.size.value.rows / 2 - this.height / 2);
          return ~~(tui.canvas.size.value.rows / 2 - 1 / 2);
        },
        // column: Math.round(columns / 2),
        // row: Math.round(rows / 2),

        // column: 1,
        // row: 1,
      },
      zIndex: 0,
    });

    tui.run();
  });
