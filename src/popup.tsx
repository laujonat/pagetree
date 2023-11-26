import { StrictMode } from "react";
import { Orientation } from "react-d3-tree";
import { createRoot } from "react-dom/client";

import PopupProvider from "./components/context/popup_provider";
import { TreeProvider } from "./components/context/tree_provider";
import DetailsPanel from "./components/popup/details_panel";
import PopupFooter from "./components/popup/footer";
import Header from "./components/popup/header";
import TreeView from "./components/tree/tree_view";
import { useCenteredTree } from "./hooks/useCenteredTree";
import useOrientation from "./hooks/useOrientation";

const Popup = () => {
  //   const [orientation, setOrientation] = useState<Orientation>("horizontal");
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
      <Header />
      <main className="container">
        <section className="inspector__container">
          <DetailsPanel />
          <div className="inspector">
            <div
              style={{ width: "100%", height: "80vh" }}
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
          <PopupFooter />
        </section>
      </main>
      {/* <HelpDialog /> */}
    </TreeProvider>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <StrictMode>
    <PopupProvider>
      <Popup />
    </PopupProvider>
  </StrictMode>
);
