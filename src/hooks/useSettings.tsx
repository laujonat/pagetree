import { useContext } from "react";

import { SettingsContext } from "../components/providers/SettingsContextProvider";

export const useSettings = () => {
  return useContext(SettingsContext);
};
