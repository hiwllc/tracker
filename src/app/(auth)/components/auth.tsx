import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { MoveRight } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function Auth() {
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
        <Button size="sm" className="gap-2 group">
          <Link href="/dashboard">
            Dashboard
            <MoveRight className="size-4 group-hover:translate-x-1 transition-transform" />{" "}
          </Link>
        </Button>
      </SignedIn>
    </>
  );
}
