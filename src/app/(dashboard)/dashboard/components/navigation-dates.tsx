"use client";

import { addMonths, subMonths, toDate } from "date-fns";
import { MoveLeftIcon, MoveRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { useParams } from "~/hooks/use-params";

export function NavigationDates() {
  const { createQueryString, qs, pathname } = useParams();
  const currentDate = toDate(qs.get("date") as string);
  const previousDate = subMonths(currentDate, 1);
  const nextDate = addMonths(currentDate, 1);

  return (
    <>
      <Button className="h-8 p-0" size="icon" variant="outline" asChild>
        <Link
          href={`${pathname}?${createQueryString("date", previousDate.toISOString())}`}
        >
          <MoveLeftIcon className="size-4" />
          <span className="sr-only">Período anterior</span>
        </Link>
      </Button>
      <Button className="h-8 p-0" size="icon" variant="outline" asChild>
        <Link
          href={`${pathname}?${createQueryString("date", nextDate.toISOString())}`}
        >
          <MoveRightIcon className="size-4" />
          <span className="sr-only">Próximo período</span>
        </Link>
      </Button>
    </>
  );
}
