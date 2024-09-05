import { ToggleTheme } from "~/components/theme/toggle";
import { Auth } from "./components/auth";
import { Logo } from "~/components/logo";

export default function Home() {
  return (
    <>
      <main className="min-h-dvh grid grid-rows-[80px_1fr_80px]">
        <header>
          <div className="container flex h-20 items-center justify-between">
            <Logo />
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
        <footer className="container">
          <ToggleTheme align="start" />
        </footer>
      </main>
    </>
  );
}
