import { UserButton } from "@clerk/nextjs";
import { ReactNode } from "react";
import { Logo } from "~/components/logo";
import { ToggleTheme } from "~/components/theme/toggle";

export default function DashboardLayout({
  children,
}: {
  children: Readonly<ReactNode>;
}) {
  return (
    <div className="w-full min-h-dvh">
      <header className="w-full">
        <div className="container h-20 flex items-center justify-between">
          <Logo />

          <div className="flex gap-2">
            <UserButton
              appearance={{
                elements: { userButtonOuterIdentifier: "text-foreground" },
              }}
              showName
            />
            <ToggleTheme />
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
