import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ReactNode } from "react";

export default function DashboardLayout({
  children,
}: {
  children: Readonly<ReactNode>;
}) {
  return (
    <div className="w-full min-h-dvh">
      <header className="w-full">
        <div className="container h-20 flex items-center justify-between">
          <h1 className="font-mono text-sm font-medium">
            <Link href="/dashboard">tracker</Link>
          </h1>
          <UserButton showName />
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
