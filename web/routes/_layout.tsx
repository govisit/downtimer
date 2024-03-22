import { PageProps } from "$fresh/server.ts";
import Header from "../components/Header.tsx";

export default function Layout({ Component }: PageProps) {
  return (
    <div class="bg-[#1F1F29] h-screen text-[#FEFFF3] p-6 flex flex-col font-mono">
      <Header />
      <div class="mt-10 h-full h-full overflow-hidden">
        <Component />
      </div>
    </div>
  );
}
