import { Command } from "$cliffy/command/mod.ts";
import { command as createTemplateCommand } from "./create.ts";
import { command as deleteTemplateCommand } from "./delete.ts";
import { command as listTemplateCommand } from "./list.ts";
import { command as createTemplateFromTimerCommand } from "./createFromTimer.ts";

export const command = new Command()
  .description("Manage templates.")
  .action(() => {
    command.showHelp();
  })
  .command("create", createTemplateCommand)
  .command("list", listTemplateCommand)
  .command("delete", deleteTemplateCommand)
  .command("create:timer", createTemplateFromTimerCommand);
