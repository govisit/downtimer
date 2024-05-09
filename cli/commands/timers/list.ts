import { Command } from "@cliffy/command";
import { Table } from "@cliffy/table";
import { getDatabaseConnection } from "../../db.ts";
import { getTopic } from "../../db/topics.ts";
import {
  cron,
  getActiveTimers,
  getAllTimers,
  getRemainingTime,
} from "../../timers.ts";
import { getPrettyDate, getPrettyDuration } from "../../utils.ts";
import { colors } from "@cliffy/ansi";
import { getRemainingTimeText } from "../../timers.ts";
import { formatStatus } from "../../timers.ts";
import { getTemplate } from "../../db/templates.ts";

export const command = new Command()
  .description("Lists all active timers by default.")
  .option("-a, --all", "Set this option to show all timers.")
  .action(async (options) => {
    const kv = await getDatabaseConnection();

    await cron(kv);

    const timers = await (() => {
      if (options.all) {
        return getAllTimers(kv);
      }

      return getActiveTimers(kv);
    })();

    if (timers.length === 0) {
      console.log(
        colors.blue(
          "No timers.\nTry starting a new timer with `timer start` or using --all option to see all timers.",
        ),
      );

      Deno.exit(1);
    }

    const table = new Table();

    const body = await Promise.all(timers.map(
      async (
        timer,
      ) => {
        const remainingTime = getRemainingTime(timer);

        const topic = timer.topicId
          ? await getTopic(kv, timer.topicId)
          : undefined;

        const template = timer.templateId
          ? await getTemplate(kv, timer.templateId)
          : undefined;

        return [
          timer.id,
          timer.name,
          getPrettyDuration(timer.duration),
          formatStatus(timer.latestLog.timerStatus),
          topic?.value ? topic.value.name : "n/a",
          template?.value ? template.value.name : "n/a",
          remainingTime ? getRemainingTimeText(remainingTime) : "n/a",
          getPrettyDate(timer.createdAt),
        ];
      },
    ));

    table
      .header([
        "Id",
        "Name",
        "Duration",
        "Status",
        "Topic",
        "Template",
        "Remaining",
        "Created at",
      ])
      .body(body)
      .border()
      .render();
  });
