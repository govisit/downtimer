import { App, staticFiles } from "fresh";
import { type State } from "./utils.ts";

export const app = new App<State>()
  .notFound((_ctx) => {
    return new Response('not found', { status: 404 });
  })
  // Add static file serving middleware
  .use(staticFiles())
  // Enable file-system based routing
  .fsRoutes();
