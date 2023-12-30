import { Command } from "$cliffy/command/mod.ts";
import { Table } from "$cliffy/table/table.ts";
import { decodeTime } from "$std/ulid/mod.ts";
import { getTemplates } from "../../db/templates.ts";

export const command = new Command()
  .description("List all templates.")
  .action(async () => {
    const templates = await getTemplates();

    const table = new Table();
    const body = templates.map(
      (
        template,
      ) => [
        template.id,
        template.name,
        template.slug,
        template.duration,
        template.topicId,
        new Date(decodeTime(template.id)).toISOString(),
      ],
    );

    table
      .header(["id", "name", "slug", "duration", "topic", "created at"])
      .body(body)
      .border()
      .render();
  });
