import { assertEquals } from "@std/assert";
import { getPrettyDuration, parseDuration } from "./utils.ts";

Deno.test("duration should be pretty automatically", () => {
  assertEquals(getPrettyDuration(500), "500ms");
  assertEquals(getPrettyDuration(1000), "1s");
  assertEquals(getPrettyDuration(60_000), "1m");
  assertEquals(getPrettyDuration(3_600_000), "1h");
});

Deno.test("it parses the duration string correctly", () => {
  assertEquals(parseDuration("1m"), 60_000);
  assertEquals(parseDuration("500ms"), 500);
  assertEquals(parseDuration("1s"), 1000);
  assertEquals(parseDuration("1h"), 3_600_000);
  assertEquals(parseDuration("0s"), undefined);
});
