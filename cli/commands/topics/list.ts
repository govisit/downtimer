import { Command } from "$cliffy/command/mod.ts";
import { Table } from "$cliffy/table/table.ts";
import { getDatabaseConnection } from "../../db.ts";
import { getTopics } from "../../db/topics.ts";
import { getPrettyDate } from "../../utils.ts";

export const command = new Command()
  .description("List all topics.")
  .action(async () => {
    const kv = await getDatabaseConnection();

    const topics = await getTopics(kv);

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
