import {
  getTimeRemaining,
  getTimeRemainingText,
  hasTimeExpired,
} from "../../timers.ts";
import { TimerWithLogs } from "../../../shared/types.ts";
// import BigText from "ink-big-text";
import { keypress, KeyPressEvent } from "$cliffy/keypress/mod.ts";

import React, { useEffect, useState } from "react";
import { Text, useApp } from "ink";
import { ringBell } from "../../utils.ts";

type CountdownProps = {
  timer: TimerWithLogs;
  font?: Font;
};

export enum Font {
  Block = "block",
  Slick = "slick",
  Tiny = "tiny",
  Grid = "grid",
  Pallet = "pallet",
  Shade = "shade",
  Simple = "simple",
  SimpleBlock = "simpleBlock",
  "3d" = "3d",
  Simple3d = "simple3d",
  Chrome = "chrome",
  Huge = "huge",
}

export const Countdown = ({ timer, font = Font.Chrome }: CountdownProps) => {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(timer));

  const { exit } = useApp();

  useEffect(() => {
    const interval = setInterval(() => {
      const timeRemaining = getTimeRemaining(timer);
      setTimeRemaining(timeRemaining);

      if (hasTimeExpired(timeRemaining)) {
        ringBell();
        exit();
        keypress().dispose(); // maybe not needed.
        return; // maybe not needed.
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    keypress().addEventListener("keydown", (event: KeyPressEvent) => {
      if (event.key === "c" && event.ctrlKey) {
        exit();
        keypress().dispose(); // maybe not needed.
      }
    });
  }, []);
  // return <></>;

  // return <BigText font={font} text={getTimeRemainingText(timeRemaining)} />;
  return <Text>{getTimeRemainingText(timeRemaining)}</Text>;
};
