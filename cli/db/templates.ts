import { kv } from "../db.ts";
import { Template } from "../../shared/types.ts";
import { getTopic } from "./topics.ts";

export const TEMPLATE_PREFIX = "templates";

const getTemplateKey = (id: string): string[] => [TEMPLATE_PREFIX, id];

export async function getTemplates(): Promise<Template[]> {
  const templates: Template[] = [];

  for await (const res of kv.list<Template>({ prefix: [TEMPLATE_PREFIX] })) {
    templates.push(res.value);
  }

  return templates;
}

async function insertTemplate(
  template: Template,
): Promise<Deno.KvCommitResult | Deno.KvCommitError> {
  const templateKey = getTemplateKey(template.id);

  if (template.topicId) {
    const topicRes = await getTopic(template.topicId) 

    if (topicRes.value) {
      return await kv
        .atomic()
        .check({ key: templateKey, versionstamp: null })
        .check(topicRes)
        .set(templateKey, template)
        .commit();
    }

  }

  return await kv
    .atomic()
    .check({ key: templateKey, versionstamp: null })
    .set(templateKey, template)
    .commit();
}
// export async function storeTemplate(template: Template): Promise<Template> {
//   const templateKey = ["templates", template.id];

//   const { ok } = await kv.atomic().check({
//     key: templateKey,
//     versionstamp: null,
//   })
//     .set(templateKey, template).commit();

//   if (!ok) {
//     throw new Error(`Template "${template.name}" already exists.`);
//   }

//   return template;
// }

// export async function getTemplate(id: string): Promise<Template | null> {
//   const key = ["templates", id];

//   return (await kv.get<Template>(key)).value;
// }

// export async function destroyTemplate(
//   id: string,
// ): Promise<void> {
//   const templateKey = ["templates", id];

//   await kv.delete(templateKey);
// }
