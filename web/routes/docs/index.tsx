import { Head } from "fresh/runtime";
import { define } from "../../utils.ts";
import { PageHeading, PageTitle } from "../../components/typography.tsx";
import { capitalize } from "effect/String";
import { repoUrl } from "../../config.ts";
import { Menu, MenuItem, NavLink } from "../../components/menu.tsx";

export default define.page(async function Docs() {
  const files: string[] = [];

  for await (const dirEntry of Deno.readDir("./docs")) {
    files.push(dirEntry.name.replace(".md", ""));
  }

  return (
    <>
      <Head>
        <title>DownTimer - Documentation</title>
      </Head>
      <PageTitle>Documentation</PageTitle>
      <Menu classPlus="mb-8">
        {files.map((file, index) => (
          <MenuItem>
            <NavLink
              href={`/docs/${file}`}
              key={index}
              name={capitalize(file)}
            />
          </MenuItem>
        ))}
      </Menu>
      <PageHeading level="h2">Other links</PageHeading>
      <Menu>
        <MenuItem>
          <NavLink href={repoUrl + "/issues"} isExternal name="Issues" />{" "}
          - Report any bugs that you encounter.
        </MenuItem>
        <MenuItem>
          <NavLink
            href={repoUrl + "/discussions"}
            isExternal
            name="Discussions"
          />{" "}
          - Ask questions or suggest features.
        </MenuItem>
        <MenuItem>
          <NavLink href={repoUrl} isExternal name="Source code" />{" "}
          - View source code and contribute.
        </MenuItem>
      </Menu>
    </>
  );
});
