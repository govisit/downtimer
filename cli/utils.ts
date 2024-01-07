import { decodeTime, ulid } from "$std/ulid/mod.ts";

export function ringBell(): void {
  // Deno.stdout.write('\u0007');
  console.log("\u0007");
}

export const generateId = () => ulid();

export function getPrettyDate(id: string): string {
  return new Date(decodeTime(id)).toLocaleString("HR-hr");
}

export function getPrettyDuration(duration: number): string {
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
