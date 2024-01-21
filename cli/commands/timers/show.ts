import { Command } from "$cliffy/command/mod.ts";
import { colors } from "$cliffy/ansi/colors.ts";
import { getDatabaseConnection } from "../../db.ts";
import { getTimer } from "../../db/timers.ts";
import { tty } from "$cliffy/ansi/tty.ts";
import figlet, { text } from "figlet";
import {
  Computed,
  GridLayout,
  handleInput,
  handleKeyboardControls,
  handleMouseControls,
  Signal,
  textWidth,
  Tui,
  VerticalLayout,
} from "$tui/mod.ts";
import { Label, Text } from "$tui/src/components/mod.ts";
import { decodeTime } from "$std/ulid/mod.ts";
import { getTimeRemaining } from "../../timers.ts";
import { Timer } from "../../../shared/types.ts";

async function getCountdown(timer: Timer): Promise<string> {
  const timeRemainingInMiliseconds = getTimeRemaining(timer);
  // const seconds = Math.round(timeRemainingInMiliseconds / 1000);
  // const minutes = Math.round(seconds / 60);
  // const hours = Math.round(minutes / 60);

  const date = new Date(timeRemainingInMiliseconds);
  const seconds = date.getUTCSeconds() < 10
    ? `0${date.getUTCSeconds()}`
    : date.getUTCSeconds();
  const minutes = date.getUTCMinutes() < 10
    ? `0${date.getUTCMinutes()}`
    : date.getUTCMinutes();
  const hours = date.getUTCHours() < 10
    ? `0${date.getUTCHours()}`
    : date.getUTCHours();

  const countdown = `${hours}:${minutes}:${seconds}`;
  const figletCountdownRaw = await figlet(countdown);

  // Dirty hack.
  const figletCountdown = figletCountdownRaw.slice(
    1,
    figletCountdownRaw.length,
  );

  return figletCountdown;
}

export const command = new Command()
  .arguments("<id:string>")
  .option(
    "-c, --countdown",
    "Eye candy and real time monitoring.",
  )
  .description("It shows details about a specific timer.")
  .action(async (options, id) => {
    const kv = await getDatabaseConnection();

    const timer = await getTimer(kv, id);

    if (timer.value === null) {
      console.error(`Timer with Id '${id}' was not found.`);

      Deno.exit(1);
    }

    if (!options.countdown) {
      throw new Error("Not yet implemented");
    }

    const tui = new Tui({
      // style: colors.bgBlack, // Make background black
      refreshRate: 1000 / 60, // Run in 60FPS
    });

    const timeRemaining = new Signal(await getCountdown(timer.value));
    let figletWidth = textWidth(
      timeRemaining.value.slice(0, timeRemaining.value.indexOf("\n")),
    );
    // const timeRemaining = new Signal("test");

    tty.clearScreen();

    tui.dispatch(); // Close Tui on CTRL+C

    handleInput(tui);
    handleMouseControls(tui);
    handleKeyboardControls(tui);

    setInterval(() => {
      getCountdown(timer.value).then((value) => {
        timeRemaining.value = value;
      });
      // timeRemaining.value = new Date().toLocaleTimeString();
    }, 1000);

    // setInterval(async () => {
    //   console.log("da fak", new Date().toLocaleTimeString());
    // }, 1000);

    new Label({
      parent: tui,
      rectangle: new Computed(() => {
        const tuiRectangle = tui.rectangle.value;
        // const figletWidth = textWidth(
        //   timeRemaining.value.slice(0, timeRemaining.value.indexOf("\n")),
        // );

        return {
          column: Math.round(tuiRectangle.width / 2 - figletWidth / 2),
          row: Math.round(tuiRectangle.height / 2 - 8),
        };
      }),
      theme: {
        base: colors.red,
      },
      text: `Name: ${timer.value.name}`,
      zIndex: 0,
    });

    new Label({
      parent: tui,
      rectangle: new Computed(() => {
        const tuiRectangle = tui.rectangle.value;
        // const figletWidth = textWidth(
        //   timeRemaining.value.slice(0, timeRemaining.value.indexOf("\n")),
        // );

        return {
          column: Math.round(tuiRectangle.width / 2 - figletWidth / 2),
          row: Math.round(tuiRectangle.height / 2 - 7),
        };
      }),
      theme: {
        base: colors.red,
      },
      text: `Duration: ${timer.value.duration}`,
      zIndex: 0,
    });

    new Label({
      parent: tui,
      rectangle: new Computed(() => {
        const tuiRectangle = tui.rectangle.value;
        // const figletWidth = textWidth(
        //   timeRemaining.value.slice(0, timeRemaining.value.indexOf("\n")),
        // );

        return {
          column: Math.round(tuiRectangle.width / 2 - figletWidth / 2),
          row: Math.round(tuiRectangle.height / 2 - 6),
        };
      }),
      theme: {
        base: colors.red,
      },
      text: `Topic: ${timer.value.topicId}`,
      zIndex: 0,
    });

    new Label({
      parent: tui,
      rectangle: new Computed(() => {
        const tuiRectangle = tui.rectangle.value;
        // const figletWidth = textWidth(
        //   timeRemaining.value.slice(0, timeRemaining.value.indexOf("\n")),
        // );

        return {
          column: Math.round(tuiRectangle.width / 2 - figletWidth / 2),
          row: Math.round(tuiRectangle.height / 2 - 5),
        };
      }),
      theme: {
        base: colors.red,
      },
      text: `Template: ${timer.value.templateId}`,
      zIndex: 0,
    });

    new Label({
      parent: tui,
      theme: {
        // base: colors.bgBlue.bold,
      },
      text: timeRemaining,
      rectangle: new Computed(() => {
        const tuiRectangle = tui.rectangle.value;
        // const figletWidth = textWidth(
        //   timeRemaining.value.slice(0, timeRemaining.value.indexOf("\n")),
        // );

        return {
          column: Math.round(tuiRectangle.width / 2 - figletWidth / 2),
          row: Math.round(tuiRectangle.height / 2 - 3),
        };
      }),
      zIndex: 0,
    });

    new Label({
      parent: tui,
      rectangle: new Computed(() => {
        const tuiRectangle = tui.rectangle.value;
        // const figletWidth = textWidth(
        //   timeRemaining.value.slice(0, timeRemaining.value.indexOf("\n")),
        // );

        return {
          column: Math.round(tuiRectangle.width / 2 - figletWidth / 2),
          row: Math.round(tuiRectangle.height / 2 + 4),
        };
      }),
      theme: {
        base: colors.yellow,
      },
      text: `Started at: ${
        new Date(decodeTime(timer.value.id)).toLocaleString("HR-hr")
      }`,
      zIndex: 0,
    });

    tui.run();
  });
