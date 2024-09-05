"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { format, startOfMonth } from "date-fns";
import { MoveRight } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export function Auth() {
  const current = startOfMonth(new Date()).toISOString();

  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <Button size="sm" className="gap-2 group">
            Entrar{" "}
            <MoveRight className="size-4 group-hover:translate-x-1 transition-transform" />{" "}
          </Button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <Button size="sm" className="gap-2 group" asChild>
          <Link href={`/dashboard?date=${current}&status=unpaid&category=all`}>
            Dashboard
            <MoveRight className="size-4 group-hover:translate-x-1 transition-transform" />{" "}
          </Link>
        </Button>
      </SignedIn>
    </>
  );
}
