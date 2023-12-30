/// <reference lib="deno.unstable" />
import { ulid } from "$std/ulid/mod.ts";

export const kv = await Deno.openKv();

export const generateId = () => ulid();
