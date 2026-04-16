import { Head } from "fresh/runtime";
import { define } from "../../utils.ts";
import { render as renderMarkdown } from "@deno/gfm";
import { PageTitle } from "../../components/typography.tsx";
import { HttpError } from "fresh";

export default define.page(async function DocsPage(ctx) {
  const content = await Deno.readTextFile(`./docs/${ctx.params.slug}.md`).catch(
    () => {
      throw new HttpError(404);
    },
  );

  const html = renderMarkdown(content);

  return (
    <>
      <Head>
        <title>DownTimer - Quickstart</title>
      </Head>
      <div class="text-sm font-mono mb-3">
        <a href="/docs">&lt;- Docs</a>
      </div>
      <PageTitle>Quickstart</PageTitle>
      {/* // deno-lint-ignore react-no-danger */}
      <div
        class="docs-page font-sans"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
});
