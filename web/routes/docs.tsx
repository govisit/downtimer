import { docsUrl } from "../config.ts";
import { Handlers } from "fresh/compat";

export const handler: Handlers = {
  GET() {
    return Response.redirect(docsUrl);
  },
};
