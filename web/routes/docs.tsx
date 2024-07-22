import { Handlers } from "$fresh/server.ts";
import { docsUrl } from "../config.ts";

export const handler: Handlers = {
  GET() {
    return Response.redirect(docsUrl);
  },
};
