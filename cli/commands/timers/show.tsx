import { Command, EnumType } from "@cliffy/command";
import { Select } from "@cliffy/prompt";
import { colors } from "@cliffy/ansi/colors";
import { getDatabaseConnection } from "../../db.ts";
import { getTimer } from "../../db/timers.ts";
import { render } from "ink";
import { Countdown, Font } from "./countdown.tsx";
import { Table } from "@cliffy/table";
import {
  completedTimerStatuses,
  cron,
  formatStatus,
  formatTimerForTable,
  getActiveTimers,
  resumeTimer,
  withLogs,
} from "../../timers.ts";
import { pauseTimer } from "../../timers.ts";
import { getPrettyDate } from "../../utils.ts";
import type { TimerWithLogs } from "../../types.ts";
import { Array as EffectArray, Match, Option } from "effect";

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
  .arguments("[id:string]")
  .option(
    "-c, --countdown",
    "Eye candy and real time monitoring.",
  )
  .option(
    "--latest",
    "Get latest created active timer.",
  )
  .option(
    "-i, --interactive",
    "Pick from a list of active timers.",
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

    const timerWithLogs = await (async () => {
      if (id) {
        const timerMaybe = await getTimer(kv, id);

        return Match.value(timerMaybe.value).pipe(
          Match.when(Match.null, () => {
            console.error(colors.red(`Timer with Id '${id}' was not found.`));

            Deno.exit(1);
          }),
          Match.orElse((timer) => withLogs(kv, timer)),
        );
      }

      if (options.latest) {
        const latestActiveTimerMaybe = await getActiveTimers(kv).then(
          EffectArray.last,
        );

        return latestActiveTimerMaybe.pipe(
          Option.match({
            onSome: (_) => _,
            onNone: () => {
              console.info("Latest active timer not found.");

              Deno.exit(0);
            },
          }),
        );
      }

      if (options.interactive) {
        const activeTimers = await getActiveTimers(kv);

        return EffectArray.match(activeTimers, {
          onEmpty: () => {
            console.info("No active timers found.");

            Deno.exit(0);
          },
          onNonEmpty: async (activeTimers) => {
            const timerId = await Select.prompt({
              message: "Select a timer",
              options: activeTimers.map((_) => ({
                name: _.name,
                value: _.id,
              })),
            });

            // NOTE: There is little chance that this will not find anything.
            return EffectArray.findFirst(activeTimers, (_) => _.id === timerId)
              .pipe(Option.getOrThrow);
          },
        });
      }

      console.error(
        "You must provide either `[id]`, or `--latest`, or `-i, --interactive`.",
      );

      Deno.exit(1);
    })();

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
