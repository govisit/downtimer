import { Command } from "$cliffy/command/mod.ts";
import { Table } from "$cliffy/table/table.ts";
import { getTemplates } from "../../db/templates.ts";
import { getPrettyDate, getPrettyDuration } from "../../utils.ts";

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
        getPrettyDuration(template.duration),
        template.topicId,
        getPrettyDate(template.id),
      ],
    );

    table
      .header(["Id", "Name", "Duration", "Topic", "Created at"])
      .body(body)
      .border()
      .render();
  });
