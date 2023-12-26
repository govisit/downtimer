// import { parseArgs } from "https://deno.land/std@0.209.0/cli/parse_args.ts";
// import { createTopic, deleteTopic, listTopics } from "./topics.ts";
// import { createTemplate, deleteTemplate, listTemplates } from "./templates.ts";
import { Command } from "$cliffy/command/mod.ts";
import { command as topicCommand } from "./commands/topics/index.ts";

await new Command()
  .name("dtimer")
  .version("0.1.0")
  .description("When your phone or PC timer is not enough.")
  .command("topic", topicCommand)
  .parse(Deno.args);

// const args = parseArgs(Deno.args);
// console.log({ args });

// async function main(): Promise<never> {
//   const resource = args._[0];
//   const action = args._[1];

//   if (!resource || !action) {
//     console.error("Seek help.");

//     return Deno.exit(1);
//   }

//   if (resource === "topic") {
//     switch (action) {
//       case "create":
//         await createTopic(args.name);
//         break;

//       case "list":
//         await listTopics();
//         break;

//       case "delete":
//         await deleteTopic(args._[2]?.toString());
//         break;

//       default:
//         console.error("Action not supported!");
//     }
//   } else if (resource === "template") {
//     switch (action) {
//       case "create":
//         await createTemplate(args.name, parseInt(args.duration), args.topic);
//         break;

//       case "list":
//         await listTemplates();
//         break;

<<<<<<< HEAD
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
||||||| parent of 5c29788 (Refactors code.)
      default:
        console.error("Action not supported!");
    }
  } else {
    console.error("Resource not implemented!");
  }
=======
//       case "delete":
//         await deleteTemplate(args._[2]?.toString());
//         break;
>>>>>>> 5c29788 (Refactors code.)

//       default:
//         console.error("Action not supported!");
//     }
//   } else {
//     console.error("Resource not implemented!");
//   }

//   return Deno.exit(0);
// }

// // main();
