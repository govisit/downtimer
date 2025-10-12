import { define } from "../utils.ts";

export default define.page(function App({ Component }) {
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
        <title>DownTimer</title>
        <link rel="stylesheet" href="/styles.css" />
        <script type="text/javascript" src="/init.js" />
        <script
          defer
          data-domain="downtimer.govisit.pro"
          src="https://plausible.laravelista.com/js/script.js"
        >
        </script>
        <link rel="icon" href="favicon.svg" />
      </head>
      <body class="bg-gray-100 dark:bg-gray-900">
        <Component />
      </body>
    </html>
  );
});
