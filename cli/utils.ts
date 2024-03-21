import { ulid } from "$std/ulid/mod.ts";

export function ringBell(): void {
  // Deno.stdout.write('\u0007');
  console.log("\u0007");
}

export const generateId = () => ulid();

export function getPrettyDate(date: number): string {
  const dateString = new Date(date).toLocaleDateString("HR-hr").replaceAll(
    ". ",
    ".",
  );
  const timeString = new Date(date).toLocaleTimeString("HR-hr");

  return `${dateString} ${timeString}`;
}

export function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function getPrettyDuration(duration: number): string {
  if (duration === 0) {
    return "-";
  }

  if (duration < 1000) {
    return `${duration}ms`;
  }

  if (duration < 60_000) {
    return `${Math.round(duration / 1000)}s`;
  }

  if (duration < 3_600_000) {
    return `${Math.round(duration / 1000 / 60)}m`;
  }

  return `${Math.round(duration / 1000 / 60 / 60)}h`;
}

/**
 * @returns It should always return the parsed duration in miliseconds or
 * undefined if the duration can't be parsed.
 */
export function parseDuration(duration: string): number | undefined {
  const result = /^([1-9]+[0-9]*)(ms|s|m|h)$/.exec(duration);

  if (!result) {
    return undefined;
  }

  const { 1: value, 2: unit } = result;

  const number = parseInt(value);

  if (isNaN(number)) {
    return undefined;
  }

  switch (unit) {
    case "s":
      return number * 1000;
    case "m":
      return number * 60 * 1000;
    case "h":
      return number * 60 * 60 * 1000;
    default:
      return number;
  }
}

/**
 * @deprecated Not used, but is pretty.
 */
export function getLongestLineLength(text: string): number {
  const lines = text.split("\n");

  const test = lines.map((line) => line.length);

  return Math.round(Math.max(...test));
}
