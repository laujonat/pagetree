import { useContext } from "react";

import { TreeContext } from "../components/context/tree_provider";

export const useTree = () => {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error("useTree must be used within a TreeProvider");
  }
  return context;
};
