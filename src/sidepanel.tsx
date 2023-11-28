import { StrictMode, useEffect, useState } from "react";
import { Orientation } from "react-d3-tree";
import { createRoot } from "react-dom/client";

import { Header } from "./components/common/header";
import DetailsPanel from "./components/common/info";
import { TreeProvider } from "./components/providers/TreeContextProvider";
import WindowProvider from "./components/providers/WindowContextProvider";
import TreeView from "./components/tree/TreeView";
import { useCenteredTree } from "./hooks/useCenteredTree";
import useOrientation from "./hooks/useOrientation";

const Sidepanel = () => {
  const [orientation, updateOrientation] = useOrientation();
  const [translate, containerRef, setTranslate] = useCenteredTree(
    orientation as Orientation
  );
  const [tabId, setTabId] = useState<string>("");

  useEffect(() => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) =>
      setTabId(String(tabs[0].id))
    );
  }, []);

  return (
    <TreeProvider
      tabid={tabId}
      translate={translate}
      setTranslate={setTranslate}
      orientation={orientation as Orientation}
    >
      <Header />
      <main className="container">
        <section className="inspector__container">
          <DetailsPanel />
          <div className="inspector">
            <div
              style={{ width: "100%", height: "65vh" }}
              id="treeWrapper"
              className="tree-container"
              ref={containerRef}
            >
              <TreeView
                orientation={orientation}
                updateOrientation={updateOrientation}
              />
            </div>
          </div>
        </section>
      </main>
    </TreeProvider>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <StrictMode>
    <WindowProvider>
      <Sidepanel />
    </WindowProvider>
  </StrictMode>
);
