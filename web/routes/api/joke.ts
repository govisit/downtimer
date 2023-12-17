import { FreshContext } from "$fresh/server.ts";
import { getSessionId } from "https://deno.land/x/deno_kv_oauth@v0.10.0/lib/get_session_id.ts";
import { getUserBySession } from "../../utils/db.ts";

// Jokes courtesy of https://punsandoneliners.com/randomness/programmer-jokes/
const JOKES = [
  "Why do Java developers often wear glasses? They can't C#.",
  "A SQL query walks into a bar, goes up to two tables and says “can I join you?”",
  "Wasn't hard to crack Forrest Gump's password. 1forrest1.",
  "I love pressing the F5 key. It's refreshing.",
  "Called IT support and a chap from Australia came to fix my network connection.  I asked “Do you come from a LAN down under?”",
  "There are 10 types of people in the world. Those who understand binary and those who don't.",
  "Why are assembly programmers often wet? They work below C level.",
  "My favourite computer based band is the Black IPs.",
  "What programme do you use to predict the music tastes of former US presidential candidates? An Al Gore Rhythm.",
  "An SEO expert walked into a bar, pub, inn, tavern, hostelry, public house.",
];

export const handler = async (
  req: Request,
  _ctx: FreshContext,
): Promise<Response> => {
  const sessionId = await getSessionId(req);

  if (sessionId === undefined) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await getUserBySession(sessionId);
  console.log({ user });

  const randomIndex = Math.floor(Math.random() * JOKES.length);
  const body = JOKES[randomIndex];
  return new Response(body);
};
