import { Command } from "$cliffy/command/mod.ts";
import { insertTopic } from "../../db/topics.ts";
import { newTopic } from "../topics.ts";

export const command = new Command()
  .option("-n, --name <name:string>", "The name of the topic.", {
    required: true,
  })
  .description("It creates a new topic.")
  .action(async (options) => {
    const topic = newTopic(options.name);

    const { ok } = await insertTopic(topic);

    if (!ok) {
      console.log(`Topic "${topic.name}" already exists.`);
      return;
    }

    console.log(`Topic "${topic.name}" created.`);
  });
