import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import { Code, PageTitle } from "../components/typography.tsx";
import { Menu, MenuItemLink } from "../components/menu.tsx";
import { getLatestDownloadAssets } from "../github.ts";

export default define.page(async function DownloadPage() {
  const downloadAssets = await getLatestDownloadAssets();

  return (
    <>
      <Head>
        <title>DownTimer - Download</title>
      </Head>
      <PageTitle>Download</PageTitle>
      <div class="font-sans">
        <p>
          Download the latest version for your operating system:
        </p>

        <br />

        <Menu classPlus="mb-8">
          {downloadAssets.map((asset) => (
            <MenuItemLink href={asset.url} name={asset.name} isExternal />
          ))}
        </Menu>

        <p>
          Remember to extract the file. We recommend to name the binary file
          {" "}
          <Code>dt</Code> after extracting it.<br />
          Add binary to PATH and then call it with <Code>dt --help</Code>.
        </p>
      </div>
    </>
  );
});
