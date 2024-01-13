import { Command } from "$cliffy/command/mod.ts";
import { command as topicCommand } from "./commands/topics/index.ts";
import { command as templateCommand } from "./commands/templates/index.ts";
import { command as timerCommand } from "./commands/timers/index.ts";

const main = new Command()
  .name("dtimer")
  .version("0.1.0")
  .description("When your phone or PC timer is not enough.")
  .action(() => {
    main.showHelp();
  })
  .command("topic", topicCommand)
  .command("template", templateCommand)
  .command("timer", timerCommand);

await main.parse(Deno.args);
