import { Command } from "@cliffy/command";
import { command as topicCommand } from "./commands/topics/index.ts";
import { command as templateCommand } from "./commands/templates/index.ts";
import { command as timerCommand } from "./commands/timers/index.ts";
import packageInfo from "./deno.json" with { type: "json" };

const main = new Command()
  .name("DownTimer")
  .version(packageInfo.version)
  .description("When your phone or PC timer is not enough.")
  .action(() => {
    main.showHelp();
  })
  .command("topic", topicCommand)
  .command("template", templateCommand)
  .command("timer", timerCommand);

await main.parse(Deno.args);
