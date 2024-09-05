import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useParams() {
  const router = useRouter();
  const pathname = usePathname();
  const qs = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(qs.toString());
      params.set(name, value);

      return params.toString();
    },
    [qs],
  );

  return { createQueryString, qs, router, pathname };
}
