import { Command } from "$cliffy/command/mod.ts";
import { Table } from "$cliffy/table/table.ts";
import { getTemplates } from "../../db/templates.ts";
import { getTopic } from "../../db/topics.ts";
import { getPrettyDate, getPrettyDuration } from "../../utils.ts";

export const command = new Command()
  .description("List all templates.")
  .action(async () => {
    const templates = await getTemplates();

    const table = new Table();
    const body = await Promise.all(templates.map(
      async (
        template,
      ) => {
        const topic = template.topicId
          ? await getTopic(template.topicId)
          : undefined;

        return [
          template.id,
          template.name,
          getPrettyDuration(template.duration),
          topic?.value?.slug,
          getPrettyDate(template.id),
        ];
      },
    ));

    table
      .header(["Id", "Name", "Duration", "Topic", "Created at"])
      .body(body)
      .border()
      .render();
  });
