import { StrictMode } from "react";
import { Orientation } from "react-d3-tree";
import { createRoot } from "react-dom/client";

import HeaderComponent from "./components/common/Header";
import { SettingsProvider } from "./components/providers/SettingsContextProvider";
import { TreeProvider } from "./components/providers/TreeContextProvider";
import WindowProvider from "./components/providers/WindowContextProvider";
import TreeLayout from "./components/tree/TreeLayout";
import { useCenteredTree } from "./hooks/useCenteredTree";
import { useSettings } from "./hooks/useSettings";

const Sidepanel = () => {
  const { settings } = useSettings();

  const [translate, dimensions, containerRef, setTranslate] = useCenteredTree(
    settings.orientation as Orientation
  );

  return (
    <TreeProvider
      dimensions={dimensions}
      translate={translate}
      settings={settings}
      setTranslate={setTranslate}
    >
      {/* <Header /> */}
      <main className="container">
        <section className="inspector__container">
          <HeaderComponent />
          <div className="inspector">
            <div id="treecanvas__container" ref={containerRef}>
              <TreeLayout />
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
