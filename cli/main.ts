import { parseArgs } from "https://deno.land/std@0.209.0/cli/parse_args.ts";
import { createTopic, deleteTopic, listTopics } from "./commands/topics.ts";
import {
  createTemplate,
  deleteTemplate,
  listTemplates,
} from "./commands/templates.ts";
import { deleteTimer, listTimers, startTimer } from "./commands/timers.ts";

const args = parseArgs(Deno.args);
console.log({ args });

async function main(): Promise<never> {
  const resource = args._[0];
  const action = args._[1];

  if (!resource || !action) {
    console.error("Seek help.");

    return Deno.exit(1);
  }

  if (resource === "topic") {
    switch (action) {
      case "create":
        await createTopic(args.name);
        break;

      case "list":
        await listTopics();
        break;

      case "delete":
        await deleteTopic(args._[2]?.toString());
        break;

      default:
        console.error("Action not supported!");
    }
  } else if (resource === "template") {
    switch (action) {
      case "create":
        await createTemplate(args.name, parseInt(args.duration), args.topic);
        break;

      case "list":
        await listTemplates();
        break;

      case "delete":
        await deleteTemplate(args._[2]?.toString());
        break;

      default:
        console.error("Action not supported!");
    }
  } else if (resource === "timer") {
    switch (action) {
      case "show":
        break;

      case "pause":
        break;

      case "resume":
        break;

      case "start":
        await startTimer(args.name, args.duration, args.topic, args.template);
        break;

      case "manual-complete":
        break;

      case "list":
        await listTimers();
        break;

      case "delete":
        await deleteTimer(args._[2]?.toString());
        break;

      default:
        console.error("Action not supported!");
    }
  } else {
    console.error("Resource not implemented!");
  }

  return Deno.exit(0);
}

main();
