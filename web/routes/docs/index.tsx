import { Head } from "fresh/runtime";
import { define } from "../../utils.ts";
import { PageTitle } from "../../components/typography.tsx";
import { capitalize } from "effect/String";

export default define.page(async function Docs() {
  const files: string[] = [];

  for await (const dirEntry of Deno.readDir("./docs")) {
    files.push(dirEntry.name.replace(".md", ""));
  }

  return (
    <>
      <Head>
        <title>DownTimer - Docs</title>
      </Head>
      <PageTitle>Documentation</PageTitle>
      <ul class="list-disc list-inside">
        {files.map((file, index) => (
          <li>
            <a href={`/docs/${file}`} key={index}>{capitalize(file)}</a>
          </li>
        ))}
      </ul>
    </>
  );
});
