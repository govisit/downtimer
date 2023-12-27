import { Command } from "$cliffy/command/mod.ts";
import { Table } from "$cliffy/table/table.ts";
import { getTopics } from "../../db/topics.ts";

export const command = new Command()
  .description("List all topics.")
  .action(async () => {
    const topics = await getTopics();

    const table = new Table();
    const body = topics.map(
      (topic) => [topic.name, topic.slug, topic.createdAt.toISOString()],
    );

    table
      .header(["name", "slug", "created at"])
      .body(body)
      .border()
      .render();
  });
