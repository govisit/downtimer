import { type PageProps } from "$fresh/server.ts";

export default function App({ Component }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <meta
          name="description"
          content="When your phone or PC timer is not enough."
        />
        <title>dtimer</title>
        <link rel="stylesheet" href="/styles.css" />
        <script type="text/javascript" src="/init.js" />
        <link rel="icon" href="favicon.svg" />
      </head>
      <body class="bg-gray-100 dark:bg-gray-900">
        <Component />
      </body>
    </html>
  );
}
