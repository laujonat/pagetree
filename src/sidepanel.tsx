import { StrictMode } from "react";
import { Orientation } from "react-d3-tree";
import { createRoot } from "react-dom/client";

import { Header } from "./components/common/header";
import DetailsPanel from "./components/common/info";
import { SettingsProvider } from "./components/providers/SettingsContextProvider";
import { TreeProvider } from "./components/providers/TreeContextProvider";
import WindowProvider from "./components/providers/WindowContextProvider";
import TreeView from "./components/tree/TreeView";
import { useCenteredTree } from "./hooks/useCenteredTree";
import { useSettings } from "./hooks/useSettings";

const Sidepanel = () => {
  const { settings } = useSettings();

  const [translate, containerRef, setTranslate] = useCenteredTree(
    settings.orientation as Orientation
  );

  return (
    <TreeProvider
      translate={translate}
      settings={settings}
      setTranslate={setTranslate}
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
              <TreeView />
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
      <SettingsProvider>
        <Sidepanel />
      </SettingsProvider>
    </WindowProvider>
  </StrictMode>
);
