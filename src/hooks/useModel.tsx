import { useState } from "react";

export function useData(initialState) {
  const [state, setState] = useState(initialState);

  function setProperty(key, value) {
    setState((prevState) => ({ ...prevState, [key]: value }));
  }

  return [state, setProperty];
}
