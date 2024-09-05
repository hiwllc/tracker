"use client";

import { startOfMonth } from "date-fns";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Logo() {
  const pathname = usePathname();
  const url = pathname.startsWith(`/dashboard`)
    ? `/dashboard?date=${startOfMonth(new Date()).toISOString()}&status=unpaid&category=all`
    : `/`;

  return (
    <h1 className="font-mono text-sm font-medium">
      <Link href={url}>tracker</Link>
    </h1>
  );
}
