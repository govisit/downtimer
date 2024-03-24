import { PageProps } from "$fresh/server.ts";
import Header from "../components/Header.tsx";

export default function Layout({ Component }: PageProps) {
  return (
    <div class="bg-gray-900 h-screen text-gray-200 p-6 flex flex-col font-mono">
      <Header />
      <div class="mt-10 h-full h-full overflow-hidden">
        <Component />
      </div>
    </div>
  );
}
