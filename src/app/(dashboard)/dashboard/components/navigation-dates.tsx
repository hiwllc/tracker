"use client";

import { addMonths, subMonths, toDate } from "date-fns";
import { MoveLeftIcon, MoveRightIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Button } from "~/components/ui/button";

export function NavigationDates() {
  const qs = useSearchParams();
  const pathname = usePathname();

  const currentDate = toDate(qs.get("date") as string);
  const previousDate = subMonths(currentDate, 1);
  const nextDate = addMonths(currentDate, 1);

  return (
    <>
      <Button className="h-8 p-0" size="icon" variant="outline" asChild>
        <Link href={`${pathname}?date=${previousDate.toISOString()}`}>
          <MoveLeftIcon className="size-4" />
          <span className="sr-only">Período anterior</span>
        </Link>
      </Button>
      <Button className="h-8 p-0" size="icon" variant="outline" asChild>
        <Link href={`${pathname}?date=${nextDate.toISOString()}`}>
          <MoveRightIcon className="size-4" />
          <span className="sr-only">Próximo período</span>
        </Link>
      </Button>
    </>
  );
}
