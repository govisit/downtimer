import type { Template } from "../types.ts";
import { getTopic } from "./topics.ts";
import { getTimersByTemplate } from "./timers.ts";

const TEMPLATE_PREFIX = "templates";
const TEMPLATE_BY_TOPIC_PREFIX = "templates_by_topic";

export const getTemplateKey = (
  templateId: string,
): string[] => [TEMPLATE_PREFIX, templateId];

export const getTemplateByTopicKey = (
  id: string,
  topicId: string,
): string[] => [TEMPLATE_BY_TOPIC_PREFIX, topicId, id];

export async function getTemplates(kv: Deno.Kv): Promise<Template[]> {
  const templates: Template[] = [];

  for await (const res of kv.list<Template>({ prefix: [TEMPLATE_PREFIX] })) {
    templates.push(res.value);
  }

  return templates;
}

export async function getTemplatesByTopic(
  kv: Deno.Kv,
  topicId: string,
): Promise<Template[]> {
  const templates: Template[] = [];

  for await (
    const res of kv.list<Template>({
      prefix: [TEMPLATE_BY_TOPIC_PREFIX, topicId],
    })
  ) {
    templates.push(res.value);
  }

  return templates;
}

/**
 * @throws {Error} When the topicId is provided, but the topic with that id is not found.
 */
export async function insertTemplate(
  kv: Deno.Kv,
  template: Template,
): Promise<Deno.KvCommitResult | Deno.KvCommitError> {
  const templateKey = getTemplateKey(template.id);

  const operation = kv
    .atomic()
    .check({ key: templateKey, versionstamp: null })
    .set(templateKey, template);

  if (template.topicId) {
    const topic = await getTopic(kv, template.topicId);

    if (topic.value === null) {
      throw new Error(`Topic with Id '${template.topicId}' does not exist.`);
    }

    const templateByTopicKey = getTemplateByTopicKey(
      template.id,
      template.topicId,
    );

    operation
      .set(templateByTopicKey, template);
  }

  return await operation.commit();
}

export async function getTemplate(
  kv: Deno.Kv,
  id: string,
): Promise<Deno.KvEntryMaybe<Template>> {
  const key = getTemplateKey(id);

  return (await kv.get<Template>(key));
}

/**
 * @throws {Error} When there are associated timers.
 */
export async function deleteTemplate(kv: Deno.Kv, id: string): Promise<void> {
  const associatedTimers = await getTimersByTemplate(kv, id);

  if (associatedTimers.length) {
    throw new Error("You must delete the associated timers first.");
  }

  const template = await getTemplate(kv, id);

  if (template.value === null) return;

  const operation = kv
    .atomic()
    .delete(template.key);

  if (template.value.topicId) {
    const templateByTopicKey = getTemplateByTopicKey(
      id,
      template.value.topicId,
    );

    operation.delete(templateByTopicKey);
  }

  await operation.commit();
}
