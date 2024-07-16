import { Command, EnumType } from "@cliffy/command";
import { colors } from "@cliffy/ansi/colors";
import { getDatabaseConnection } from "../../db.ts";
import { getTimer } from "../../db/timers.ts";
import React from "react";
import { render } from "ink";
import { Countdown, Font } from "./countdown.tsx";
import { Table } from "@cliffy/table";
import {
  completedTimerStatuses,
  cron,
  formatStatus,
  formatTimerForTable,
  resumeTimer,
  withLogs,
} from "../../timers.ts";
import { pauseTimer } from "../../timers.ts";
import { getPrettyDate } from "../../utils.ts";
import { TimerWithLogs } from "../../../shared/types.ts";

export async function countdownOnPause(
  kv: Deno.Kv,
  timerWithLogs: TimerWithLogs,
) {
  await pauseTimer(kv, timerWithLogs);

  const freshTimer = await getTimer(kv, timerWithLogs.id);

  const freshTimerWithLogs = await withLogs(kv, freshTimer.value!);

  return freshTimerWithLogs;
}

export async function countdownOnResume(
  kv: Deno.Kv,
  timerWithLogs: TimerWithLogs,
) {
  await resumeTimer(kv, timerWithLogs);

  const freshTimer = await getTimer(kv, timerWithLogs.id);

  const freshTimerWithLogs = await withLogs(kv, freshTimer.value!);

  return freshTimerWithLogs;
}

export const font = new EnumType(Font);

export const command = new Command()
  .type("font", font)
  .arguments("<id:string>")
  .option(
    "-c, --countdown",
    "Eye candy and real time monitoring.",
  )
  .option(
    "-l, --logs",
    "Displays logs for the timer.",
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

    if (
      options.countdown &&
      !completedTimerStatuses.includes(timerWithLogs.latestLog.timerStatus)
    ) {
      render(
        <Countdown
          font={options.font}
          timer={timerWithLogs}
          onPause={async () => await countdownOnPause(kv, timerWithLogs)}
          onResume={async () => await countdownOnResume(kv, timerWithLogs)}
        />,
      );
    } else {
      const table = new Table();

      const body = await formatTimerForTable(kv, timerWithLogs);

      table
        .body(body)
        .padding(2)
        .render();

      if (options.logs) {
        const logsTable = new Table();
        console.log("");
        console.log("Logs:");

        const body = timerWithLogs.logs.map((log) => {
          return [
            formatStatus(log.timerStatus),
            getPrettyDate(log.createdAt),
          ];
        });

        logsTable
          .header(["Status", "Timestamp"])
          .body(body)
          .border()
          .render();
      }
    }
  });
