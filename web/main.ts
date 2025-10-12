import { App, staticFiles } from "fresh";
import { type State } from "./utils.ts";

export const app = new App<State>()
  // Add static file serving middleware
  .use(staticFiles())
  // Enable file-system based routing
  .fsRoutes();
