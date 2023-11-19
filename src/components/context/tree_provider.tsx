import React, { createContext, useEffect, useState } from "react";
import { Orientation, TreeProps } from "react-d3-tree";

import { convertToD3Format } from "../../parser";

type UpdateTreeFunction = (a: Partial<TreeProps>) => void;

export type ProviderValue = {
  treeState: Partial<TreeProps>; // since you know this is what the provider will be passing
  loaded: boolean;
  updateTreeState: UpdateTreeFunction;
};

export type DefaultValue = undefined;

export type ContextValue = DefaultValue | ProviderValue;

interface TreeProviderProps {
  children: React.ReactNode;
  orientation: Orientation;
  width: number;
  height: number;
}

export const TreeContext = createContext<ContextValue>(undefined);

export const TreeProvider = ({
  children,
  width,
  height,
  orientation,
}: TreeProviderProps) => {
  const [loaded, setLoaded] = useState(false);
  const [treeState, setTreeState] = useState<TreeProps>({
    centeringTransitionDuration: 800,
    collapsible: true,
    data: [],
    depthFactor: undefined,
    dimensions: undefined,
    draggable: true,
    enableLegacyTransitions: false,
    hasInteractiveNodes: true,
    initialDepth: 1,
    nodeSize: { x: 100, y: 100 },
    orientation: "vertical",
    rootNodeClassName: "tree__root",
    branchNodeClassName: "tree__branch",
    leafNodeClassName: "tree__leaf",
    scaleExtent: { min: 0.25, max: 2 },
    separation: { siblings: 0.5, nonSiblings: 0 },
    shouldCollapseNeighborNodes: true,
    transitionDuration: 500,
    translate: { x: 0, y: 0 },
    zoom: 1,
    zoomable: true,
  });

  useEffect(() => {
    console.log("tree-provider- orientation", orientation);
    console.log("widthheight", width, height);
    if (orientation === "vertical") {
      updateTreeState({
        orientation: orientation,
        separation: { siblings: 1, nonSiblings: 2 },
        dimensions: { width, height },
        translate: { x: width / 2, y: height },
      });
    } else {
      updateTreeState({
        orientation: orientation,
        separation: { siblings: 0.5, nonSiblings: 0 },
        dimensions: { width, height },
        translate: { x: width, y: height },
      });
    }
  }, [orientation]);

  useEffect(() => {
    async function scanActiveTabHTML(message) {
      chrome.tabs.query(
        { active: true, lastFocusedWindow: true },
        async (tabs) => {
          if (tabs[0]?.id) {
            const response = await chrome.tabs.sendMessage(tabs[0].id, message);
            // @ts-ignore
            if (response?.data) {
              // @ts-ignore
              const r3dtNodes = await convertToD3Format(response.data);
              console.log(r3dtNodes);
              updateTreeState({
                data: r3dtNodes,
                dimensions: { width, height },
                translate: { x: width / 2, y: height / 2 },
              });
              setLoaded(true);
            }
          }
        }
      );
    }
    scanActiveTabHTML({ target: "popup", action: "extension-scan-element" });
  }, [width, height]);

  const updateTreeState = (newState: Partial<TreeProps>) => {
    setTreeState((prevState) => ({ ...prevState, ...newState }));
  };

  const value = {
    loaded,
    treeState,
    updateTreeState,
  };

  return <TreeContext.Provider value={value}>{children}</TreeContext.Provider>;
};
