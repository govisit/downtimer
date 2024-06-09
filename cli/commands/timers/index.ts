import { Command } from "@cliffy/command";
import { command as startTimerCommand } from "./start.ts";
import { command as startTimerFromTemplateCommand } from "./startFromTemplate.tsx";
import { command as deleteTimerCommand } from "./delete.ts";
import { command as listTimerCommand } from "./list.ts";
import { command as pauseTimerCommand } from "./pause.ts";
import { command as resumeTimerCommand } from "./resume.ts";
import { command as manualCompleteTimerCommand } from "./manualComplete.ts";
import { command as showTimerCommand } from "./show.tsx";

export const command = new Command()
  .description("Manage timers.")
  .action(() => {
    command.showHelp();
  })
  .command("start", startTimerCommand)
  .command("start:template", startTimerFromTemplateCommand)
  .command("list", listTimerCommand)
  .command("pause", pauseTimerCommand)
  .command("resume", resumeTimerCommand)
  .command("manual-complete", manualCompleteTimerCommand)
  .command("show", showTimerCommand)
  .command("delete", deleteTimerCommand);
