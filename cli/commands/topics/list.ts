import { Command } from "$cliffy/command/mod.ts";
import { Table } from "$cliffy/table/table.ts";
import { decodeTime } from "$std/ulid/mod.ts";
import { getTopics } from "../../db/topics.ts";

export const command = new Command()
  .description("List all topics.")
  .action(async () => {
    const topics = await getTopics();

    const table = new Table();
    const body = topics.map(
      (
        topic,
      ) => [
        topic.id,
        topic.name,
        topic.slug,
        new Date(decodeTime(topic.id)).toISOString(),
      ],
    );

    table
      .header(["id", "name", "slug", "created at"])
      .body(body)
      .border()
      .render();
  });
