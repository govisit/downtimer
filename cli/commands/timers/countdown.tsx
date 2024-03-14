import {
  activeStatuses,
  formatStatus,
  getTimeRemaining,
  getTimeRemainingText,
  hasTimeExpired,
} from "../../timers.ts";
import { TimerStatus, TimerWithLogs } from "../../../shared/types.ts";
import BigText from "ink-big-text";
import { keypress, KeyPressEvent } from "$cliffy/keypress/mod.ts";

import React, { useCallback, useEffect, useState } from "react";
import { Box, useApp } from "ink";
import { getPrettyDate, getPrettyDuration, ringBell } from "../../utils.ts";
import { Text } from "ink";

type CountdownProps = {
  timer: TimerWithLogs;
  onPause: () => Promise<TimerWithLogs>;
  onResume: () => Promise<TimerWithLogs>;
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

export const Countdown = (
  { timer: timer0, onPause, onResume, font = Font.Chrome }: CountdownProps,
) => {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(timer0));
  const [timer, setTimer] = useState(timer0);

  const { exit } = useApp();

  useEffect(() => {
    if (!activeStatuses.includes(timer.latestLog.timerStatus)) {
      return () => {
      };
    }

    const interval = setInterval(() => {
      const timeRemaining1 = getTimeRemaining(timer);

      setTimeRemaining(timeRemaining1);

      if (hasTimeExpired(timeRemaining1)) {
        ringBell();
        exit();
        Deno.exit(0);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [timer, setTimeRemaining, getTimeRemaining, hasTimeExpired]);

  const handleKeyPresses = useCallback(async (
    event: KeyPressEvent,
  ) => {
    if (event.key === "c" && event.ctrlKey) {
      exit();
      Deno.exit(0);
    }

    if (event.key === "space") {
      if (activeStatuses.includes(timer.latestLog.timerStatus)) {
        const freshTimer = await onPause();
        setTimer(freshTimer);
      }

      if (timer.latestLog.timerStatus === TimerStatus.Paused) {
        const freshTimer = await onResume();
        setTimer(freshTimer);
      }
    }
  }, [timer.latestLog, onPause, onResume, setTimer]);

  useEffect(() => {
    keypress().addEventListener("keydown", handleKeyPresses);

    return () => {
      keypress().removeEventListener("keydown", handleKeyPresses);
    };
  }, [handleKeyPresses]);

  return (
    <Box flexDirection="column">
      <Text>Name: {timer.name}</Text>
      <Text>Duration: {getPrettyDuration(timer.duration)}</Text>
      <Text>Status: {formatStatus(timer.latestLog.timerStatus)}</Text>
      <Text>Created at: {getPrettyDate(timer.id)}</Text>
      <BigText font={font} text={getTimeRemainingText(timeRemaining)} />
    </Box>
  );
};
