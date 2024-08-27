import { format } from "date-fns";
import { Auth } from "./components/auth";

export default function Home() {
  return (
    <main className="min-h-dvh grid grid-rows-[80px_1fr_80px]">
      <header>
        <div className="container flex h-20 items-center justify-between">
          <h1 className="font-semibold font-mono text-xs">tracker</h1>
          <Auth />
        </div>
      </header>

      <div className="container h-calc(100dvh-160px) flex items-center">
        <div className="space-y-4">
          <h2 className="font-mono text-sm font-semibold">tracker</h2>
          <p className="font-mono font-medium text-sm text-balance">
            Controle financeiro de forma simples.
          </p>
        </div>
      </div>
    </main>
  );
}
