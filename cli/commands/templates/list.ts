import { Command } from "@cliffy/command";
import { Table } from "@cliffy/table";
import { getDatabaseConnection } from "../../db.ts";
import { getTemplates } from "../../db/templates.ts";
import { getTopic } from "../../db/topics.ts";
import { getPrettyDate, getPrettyDuration } from "../../utils.ts";
import { colors } from "@cliffy/ansi/colors";

export const command = new Command()
  .description("Lists all templates.")
  .action(async () => {
    const kv = await getDatabaseConnection();

    const templates = await getTemplates(kv);

    if (templates.length === 0) {
      console.log(
        colors.blue(
          "No templates.\nTry creating a new template with `template create`.",
        ),
      );

      Deno.exit(1);
    }

    const table = new Table();

    const body = await Promise.all(templates.map(
      async (
        template,
      ) => {
        const topic = template.topicId
          ? await getTopic(kv, template.topicId)
          : undefined;

        return [
          template.id,
          template.name,
          getPrettyDuration(template.duration),
          topic?.value?.slug,
          getPrettyDate(template.createdAt),
        ];
      },
    ));

    table
      .header(["Id", "Name", "Duration", "Topic", "Created at"])
      .body(body)
      .border()
      .render();
  });
