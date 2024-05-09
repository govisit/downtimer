import { Command } from "@cliffy/command";
import { command as createTopicCommand } from "./create.ts";
import { command as deleteTopicCommand } from "./delete.ts";
import { command as listTopicCommand } from "./list.ts";

export const command = new Command()
  .description("Manage topics.")
  .action(() => {
    command.showHelp();
  })
  .command("create", createTopicCommand)
  .command("list", listTopicCommand)
  .command("delete", deleteTopicCommand);
