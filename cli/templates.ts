import {
  destroyTemplate,
  getTemplate,
  getTemplates,
  newTemplate,
  storeTemplate,
} from "./db/templates.ts";

export async function createTemplate(
  name: string | undefined,
  duration: number | undefined,
  topicSlug: string | undefined,
): Promise<void> {
  if (!name) {
    console.error("Argument `--name=` is required.");

    return;
  }

  if (!duration) {
    console.error("Argument `--duration=` is required.");

    return;
  }

  const templateTmp = newTemplate(name, duration, topicSlug);

  try {
    const template = await storeTemplate(templateTmp);
    console.log(`Template "${template.name}" created.`);
  } catch (_) {
    console.log(`Template "${templateTmp.name}" already exists.`);
  }
}

export async function listTemplates(): Promise<void> {
  const templates = await getTemplates();

  console.log(templates);
}

export async function deleteTemplate(slug: string | undefined): Promise<void> {
  if (!slug) {
    console.error("Third argument 'slug' is required.");

    return;
  }

  const templateRes = await getTemplate(slug);

  if (!templateRes) {
    console.log(`No template with slug ${slug} found.`);
    return;
  }

  await destroyTemplate(slug);

  console.log(`Template "${slug}" deleted.`);
}
