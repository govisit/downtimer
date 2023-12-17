import { slug } from "https://deno.land/x/slug@v1.1.0/mod.ts";
import { generateId, kv } from "../db.ts";
import { Template } from "../../shared/types.ts";

export function newTemplate(
  name: string,
  duration: number,
  topic: string | undefined,
): Template {
  return {
    id: generateId(),
    name: name,
    slug: slug(name),
    duration: duration,
    topicId: topic,
    createdAt: new Date(),
  };
}

export async function storeTemplate(template: Template): Promise<Template> {
  const templateKey = ["templates", template.id];

  const { ok } = await kv.atomic().check({
    key: templateKey,
    versionstamp: null,
  })
    .set(templateKey, template).commit();

  if (!ok) {
    throw new Error(`Template "${template.name}" already exists.`);
  }

  return template;
}

export async function getTemplates(): Promise<Template[]> {
  const templates: Template[] = [];

  for await (const res of kv.list<Template>({ prefix: ["templates"] })) {
    templates.push(res.value);
  }

  return templates;
}

export async function getTemplate(id: string): Promise<Template | null> {
  const key = ["templates", id];

  return (await kv.get<Template>(key)).value;
}

export async function destroyTemplate(
  id: string,
): Promise<void> {
  const templateKey = ["templates", id];

  await kv.delete(templateKey);
}
