import { useEffect, useState } from "react";
import { Orientation } from "react-d3-tree";

const useOrientation = () => {
  const [orientation, setOrientation] = useState<Orientation>("horizontal");

  useEffect(() => {
    // Fetch orientation from Chrome storage on mount
    chrome.storage.sync.get(["orientation"], (result) => {
      setOrientation(result.orientation || "horizontal");
    });
  }, []);

  const updateOrientation = (newOrientation: Orientation) => {
    setOrientation(newOrientation);
    chrome.storage.sync.set({ orientation: newOrientation });
  };

  return [orientation, updateOrientation];
};

export default useOrientation;
