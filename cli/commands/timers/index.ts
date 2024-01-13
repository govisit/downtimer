import { Command } from "$cliffy/command/mod.ts";
import { command as startTimerCommand } from "./start.ts";
import { command as startTimerFromTemplateCommand } from "./startFromTemplate.ts";
import { command as deleteTimerCommand } from "./delete.ts";
import { command as listTimerCommand } from "./list.ts";
import { command as pauseTimerCommand } from "./pause.ts";

export const command = new Command()
  .description("Manage timers.")
  .action(() => {
    command.showHelp();
  })
  .command("start", startTimerCommand)
  .command("start:template", startTimerFromTemplateCommand)
  .command("list", listTimerCommand)
  .command("pause", pauseTimerCommand)
  .command("delete", deleteTimerCommand);
