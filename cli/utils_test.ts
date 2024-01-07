import { assertEquals } from "$std/assert/mod.ts";
import { getPrettyDuration } from "./utils.ts";

Deno.test("duration should be pretty automatically", () => {
  assertEquals(getPrettyDuration(500), "500ms");
  assertEquals(getPrettyDuration(1000), "1s");
  assertEquals(getPrettyDuration(60_000), "1m");
  assertEquals(getPrettyDuration(3_600_000), "1h");
});
