import {
  createGitHubOAuthConfig,
  createHelpers,
} from "https://deno.land/x/deno_kv_oauth@v0.10.0/mod.ts";
import type { Plugin } from "$fresh/server.ts";
import { getAuthenticatedUser } from "../utils/github.ts";
import { User } from "../utils/types.ts";
import { deleteSession, setUserWithSession } from "../utils/db.ts";

const { signIn, handleCallback, signOut, getSessionId } = createHelpers(
  createGitHubOAuthConfig(),
);

export default {
  name: "kv-oauth",
  routes: [
    {
      path: "/signin",
      async handler(req) {
        return await signIn(req);
      },
    },
    {
      path: "/callback",
      async handler(req) {
        // Return object also includes `accessToken` and `sessionId` properties.
        const { response, tokens, sessionId } = await handleCallback(req);

        const ghUser = await getAuthenticatedUser(tokens!.accessToken);

        console.log({ ghUser });

        const user: User = {
          id: String(ghUser.id),
          login: ghUser.login,
          name: ghUser.name,
          email: ghUser.email,
          avatarUrl: ghUser.avatar_url,
        };

        await setUserWithSession(user, sessionId);

        console.log({ user });

        return response;
      },
    },
    {
      path: "/signout",
      async handler(req) {
        const session = await getSessionId(req);

        if (session) {
          await deleteSession(session);
        }

        return await signOut(req);
      },
    },
    {
      path: "/protected",
      async handler(req) {
        return await getSessionId(req) === undefined
          ? new Response("Unauthorized", { status: 401 })
          : new Response("You are allowed");
      },
    },
  ],
} as Plugin;
