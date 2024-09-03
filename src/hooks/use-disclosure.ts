import { useCallback, useState } from "react";

type Props = {
  /**
   * Define the initial state
   */
  initialState?: "opened" | "closed";
};

export function useDisclosure({ initialState = "closed" }: Props) {
  const [state, setState] = useState(initialState);

  const open = useCallback(() => setState("opened"), []);
  const close = useCallback(() => setState("closed"), []);

  const toggle = useCallback(() => {
    if (state === "opened") {
      setState("closed");
    } else {
      setState("opened");
    }
  }, [state]);

  return {
    state,
    open,
    close,
    toggle,
    isOpened: state === "opened",
    isClosed: state === "closed",
  };
}
