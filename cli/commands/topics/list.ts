import { Command } from "$cliffy/command/mod.ts";
import { Table } from "$cliffy/table/table.ts";
import { getDatabaseConnection } from "../../db.ts";
import { getTopics } from "../../db/topics.ts";
import { getPrettyDate } from "../../utils.ts";
import { colors } from "$cliffy/ansi/colors.ts";

export const command = new Command()
  .description("Lists all topics.")
  .action(async () => {
    const kv = await getDatabaseConnection();

    const topics = await getTopics(kv);

    if (topics.length === 0) {
      console.log(
        colors.blue(
          "No topics.\nTry creating a new topic with `topic create`.",
        ),
      );

      Deno.exit(1);
    }

    const table = new Table();

    const body = topics.map(
      (
        topic,
      ) => [
        topic.id,
        topic.name,
        topic.slug,
        getPrettyDate(topic.id),
      ],
    );

    table
      .header(["Id", "Name", "Slug", "Created at"])
      .body(body)
      .border()
      .render();
  });
