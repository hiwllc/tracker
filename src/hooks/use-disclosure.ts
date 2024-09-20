import { useCallback, useState } from "react";

type Props = {
  /**
   * Define the initial state
   */
  initialState?: boolean;
};

export function useDisclosure({ initialState = false }: Props) {
  const [state, setState] = useState(initialState);

  const open = useCallback(() => setState(true), []);
  const close = useCallback(() => setState(false), []);

  const toggle = useCallback(() => {
    console.log({ state });
    setState(!state);
  }, [state]);

  return {
    state,
    open,
    close,
    toggle,
    isOpened: state,
    isClosed: state,
  };
}
