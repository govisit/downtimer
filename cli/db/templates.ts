import { kv } from "../db.ts";
import { Template } from "../../shared/types.ts";
import { getTopic } from "./topics.ts";

const TEMPLATE_PREFIX = "templates";
const TEMPLATE_BY_TOPIC_PREFIX = "templates_by_topic";

const getTemplateKey = (
  topicId: string,
): string[] => [TEMPLATE_PREFIX, topicId];

const getTemplateByTopicKey = (
  id: string,
  topicId: string,
): string[] => [TEMPLATE_BY_TOPIC_PREFIX, topicId, id];

export async function getTemplates(): Promise<Template[]> {
  const templates: Template[] = [];

  for await (const res of kv.list<Template>({ prefix: [TEMPLATE_PREFIX] })) {
    templates.push(res.value);
  }

  return templates;
}

export async function getTemplatesByTopic(
  topicId: string,
): Promise<Template[]> {
  const templates: Template[] = [];

  for await (
    const res of kv.list<Template>({ prefix: [TEMPLATE_PREFIX, topicId] })
  ) {
    templates.push(res.value);
  }

  return templates;
}

export async function insertTemplate(
  template: Template,
): Promise<Deno.KvCommitResult | Deno.KvCommitError> {
  const templateKey = getTemplateKey(template.id);

  if (template.topicId) {
    const topicRes = await getTopic(template.topicId);

    const templateByTopicKey = getTemplateByTopicKey(
      template.id,
      template.topicId,
    );

    return await kv
      .atomic()
      .check({ key: templateKey, versionstamp: null })
      .check(topicRes)
      .set(templateKey, template)
      .set(templateByTopicKey, template)
      .commit();
  }

  return await kv
    .atomic()
    .check({ key: templateKey, versionstamp: null })
    .set(templateKey, template)
    .commit();
}

export async function getTemplate(
  id: string,
): Promise<Deno.KvEntryMaybe<Template>> {
  const key = getTemplateKey(id);

  return (await kv.get<Template>(key));
}

export async function deleteTemplate(id: string): Promise<void> {
  const templateKey = getTemplateKey(id);

  let res = { ok: false };

  while (!res.ok) {
    const templateRes = await getTemplate(id);

    if (templateRes.value === null) return;

    if (templateRes.value.topicId) {
      const templateByTopicKey = getTemplateByTopicKey(
        id,
        templateRes.value.topicId,
      );

      res = await kv.atomic()
        .check(templateRes)
        .delete(templateKey)
        .delete(templateByTopicKey)
        .commit();

      continue;
    }

    res = await kv.atomic()
      .check(templateRes)
      .delete(templateKey)
      .commit();
  }
}
