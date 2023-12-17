import { Timer, TimerStatus } from "../../shared/types.ts";
import { newLog, storeLog } from "../db/logs.ts";
import { getTemplate } from "../db/templates.ts";
import {
  destroyTimer,
  getTimer,
  getTimers,
  newTimer,
  storeTimer,
} from "../db/timers.ts";

export async function startTimer(
  name: string | undefined,
  duration: number | undefined,
  topicSlug: string | undefined,
  templateSlug: string | undefined,
): Promise<void> {
  const fromTemplate = !!templateSlug;

  let timerTmp: Timer;

  if (fromTemplate) {
    const template = await getTemplate(templateSlug);

    if (!template) {
      console.error(`Template with slug "${templateSlug} not found."`);
      return;
    }

    timerTmp = newTimer(
      name || template.name,
      duration || template.duration,
      topicSlug || template.topicId,
      template.slug,
    );
  } else {
    if (!name) {
      console.error("Argument `--name=` is required.");
      return;
    }

    if (!duration) {
      console.error("Argument `--duration=` is required.");
      return;
    }

    timerTmp = newTimer(name, duration, topicSlug, templateSlug);
  }

  const timer = await storeTimer(timerTmp);

  const log = newLog(timer.id, TimerStatus.Started);

  await storeLog(log);

  console.log(`Timer "${timer.name}" started.`);
}

export async function listTimers(): Promise<void> {
  const timers = await getTimers();

  console.log(timers);
}

export async function deleteTimer(id: string | undefined): Promise<void> {
  if (!id) {
    console.error("Third argument 'id' is required.");

    return;
  }

  const timerRes = await getTimer(id);

  if (!timerRes) {
    console.log(`No timer with id ${id} found.`);
    return;
  }

  await destroyTimer(id);

  console.log(`Timer "${id}" deleted.`);
}
