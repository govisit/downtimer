import { Command } from "@cliffy/command";
import { Select } from "@cliffy/prompt";
import { colors } from "@cliffy/ansi";
import { getDatabaseConnection } from "../../db.ts";
import { getTemplate, getTemplates } from "../../db/templates.ts";
import { getTopic, getTopicBySlug } from "../../db/topics.ts";
import React from "react";
import {
  completedTimerStatuses,
  getTemplateOverrides,
  newTimerFromTemplate,
  Overrides,
  startTimer,
  withLogs,
} from "../../timers.ts";
import { parseDuration } from "../../utils.ts";
import { render } from "ink";
import { countdownOnPause, countdownOnResume, font } from "./show.tsx";
import { Countdown } from "./countdown.tsx";
import { Template, Topic } from "../../../shared/types.ts";

async function getTopicIfAny(
  kv: Deno.Kv,
  template: Template,
): Promise<Topic | null> {
  if (!template.topicId) {
    return null;
  }

  const topic = await getTopic(kv, template.topicId);

  if (!topic) {
    throw new Error(
      `Topic '${template.topicId}' not found for template '${template.id}'`,
    );
  }

  return topic.value;
}

async function getTemplateId(
  kv: Deno.Kv,
  templateId0: string | undefined,
): Promise<string> {
  if (typeof templateId0 === "string") {
    return templateId0;
  }

  const templates = await getTemplates(kv);

  const options = await Promise.all(templates.map(async (template) => {
    const topic = await getTopicIfAny(kv, template);

    const topicName = topic ? `#${topic.slug}` : "";

    return {
      name: `${template.name} ${topicName}`,
      value: template.id,
    };
  }));

  const result = await Select.prompt<string>({
    message: "Choose a template",
    options: options,
  });

  return result;
}

export const command = new Command()
  .type("font", font)
  .arguments("[templateId:string]")
  .option("-n, --name <name:string>", "Override the name of the timer.")
  .option(
    "-d, --duration <duration:string>",
    "Override the duration of the timer.",
  )
  .option(
    "-t, --topic <topic:string>",
    "Override the topic to which the timer belongs.",
  )
  .option(
    "--font <font:font>",
    "Font for countdown feature. Possible values",
    {
      required: false,
    },
  )
  .option(
    "-c, --countdown",
    "Eye candy and real time monitoring.",
  )
  .description(
    "Starts a new timer using a template. You can override template values.",
  )
  .action(async (options, templateId0) => {
    const kv = await getDatabaseConnection();

    const templateId = await getTemplateId(kv, templateId0);

    const template = await getTemplate(kv, templateId);

    if (!template.value) {
      console.error(
        colors.red(`Template with ID '${templateId}' was not found`),
      );

      Deno.exit(1);
    }

    const topic = options.topic
      ? await getTopicBySlug(kv, options.topic)
      : undefined;

    if (options.topic && !topic?.value) {
      console.error(
        colors.red(`Topic with slug '${options.topic}' was not found`),
      );

      Deno.exit(1);
    }

    const duration = options.duration
      ? parseDuration(options.duration)
      : undefined;

    if (options.duration && !duration) {
      console.error(
        colors.red(
          `Duration can't be parsed. Valid format is {integer}[ms|s|m|h].`,
        ),
      );

      Deno.exit(1);
    }

    const overrides: Overrides = getTemplateOverrides(
      options.name,
      duration,
      topic?.value?.id,
    );

    const timer = newTimerFromTemplate(template.value, overrides);

    await startTimer(kv, timer);

    const timerWithLogs = await withLogs(kv, timer);

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
      console.log(colors.green(`Timer "${timer.id}" started.`));
    }
  });
