import { useState } from "react";
import { TreeProps } from "react-d3-tree";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SetPropertyFunction = (key: keyof TreeProps, value: any) => void;
type ComplexStateHook = [TreeProps, SetPropertyFunction];

export function useData(initialState: TreeProps): ComplexStateHook {
  const [state, setState] = useState<TreeProps>(initialState);

  function setProperty(key, value) {
    setState((prevState) => ({ ...prevState, [key]: value }));
  }

  return [state, setProperty];
}
