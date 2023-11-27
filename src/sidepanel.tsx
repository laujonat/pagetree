import { StrictMode } from "react";
import { Orientation } from "react-d3-tree";
import { createRoot } from "react-dom/client";

import { Header } from "./components/common/header";
import DetailsPanel from "./components/common/info";
import Tabs from "./components/common/tabs";
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

  return (
    <TreeProvider
      translate={translate}
      setTranslate={setTranslate}
      orientation={orientation as Orientation}
    >
      <Tabs />
      <Header />
      <main className="container">
        <section className="inspector__container">
          <div className="inspector" ref={containerRef}>
            <div
              style={{ width: "100%", height: "65vh" }}
              id="treeWrapper"
              className="tree-container"
            >
              <TreeView
                orientation={orientation}
                updateOrientation={updateOrientation}
              />
            </div>
          </div>
          <DetailsPanel />
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
