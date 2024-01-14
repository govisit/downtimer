import { Template, Timer } from "../shared/types.ts";
import { generateId } from "./utils.ts";
import { Overrides } from "./timers.ts";
import { insertTemplate } from "./db/templates.ts";

export function newTemplate(
  name: string,
  duration: number,
  topicId: string | undefined,
): Template {
  return {
    id: generateId(),
    name: name,
    duration: duration,
    topicId: topicId,
  };
}

export function newTemplateFromTimer(
  timer: Timer,
  overrides: Overrides,
): Template {
  const name = overrides.name || timer.name;

  return {
    id: generateId(),
    name: name,
    duration: overrides.duration || timer.duration,
    topicId: overrides.topicId || timer.topicId,
  };
}

export async function createTemplate(
  kv: Deno.Kv,
  name: string,
  duration: number,
  topicId: string | undefined,
): Promise<readonly [boolean, Template]> {
  const template = newTemplate(name, duration, topicId);

  const { ok } = await insertTemplate(kv, template);

  return [ok, template];
}
