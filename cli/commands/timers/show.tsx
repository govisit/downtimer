import { Command, EnumType } from "$cliffy/command/mod.ts";
import { colors } from "$cliffy/ansi/colors.ts";
import { getDatabaseConnection } from "../../db.ts";
import { getTimer } from "../../db/timers.ts";
import React from "react";
import { render } from "ink";
import { Countdown, Font } from "./countdown.tsx";
import { Table } from "$cliffy/table/table.ts";
import { cron, formatTimerForTable, withLogs } from "../../timers.ts";

const font = new EnumType(Font);

export const command = new Command()
  .type("font", font)
  .arguments("<id:string>")
  .option(
    "-c, --countdown",
    "Eye candy and real time monitoring.",
  )
  .description("Shows details about a timer.")
  .option(
    "--font <font:font>",
    "Font for countdown feature. Possible values",
    {
      required: false,
    },
  )
  .action(async (options, id) => {
    const kv = await getDatabaseConnection();

    await cron(kv);

    const timer = await getTimer(kv, id);

    if (timer.value === null) {
      console.error(colors.red(`Timer with Id '${id}' was not found.`));

      Deno.exit(1);
    }

    const timerWithLogs = await withLogs(kv, timer.value);

    const table = new Table();

    const body = await formatTimerForTable(kv, timerWithLogs);

    table
      .body(body)
      .padding(2)
      .render();

    if (options.countdown) {
      render(<Countdown timer={timerWithLogs} />);
    }
  });
