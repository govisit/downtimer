import { Command } from "$cliffy/command/mod.ts";
import { Table } from "$cliffy/table/table.ts";
import { getTemplates } from "../../db/templates.ts";

export const command = new Command()
  .description("List all templates.")
  .action(async () => {
    const templates = await getTemplates();

    const table = new Table();
    const body = templates.map(
      (template) => [template.name, template.slug, template.createdAt.toISOString()],
    );

    table
      .header(["name", "slug", "created at"])
      .body(body)
      .border()
      .render();
  });
