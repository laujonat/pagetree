import React, { ReactElement } from "react";

import { render, RenderOptions } from "@testing-library/react";

// Import your context providers
import {
  defaultSettings,
  SettingsProvider,
} from "./components/providers/SettingsContextProvider";
import {
  TreeProvider,
  TreeProviderProps,
} from "./components/providers/TreeContextProvider";
import { WindowProvider } from "./components/providers/WindowContextProvider";

type AllTheProvidersProps = {
  children: React.ReactNode;
} & Partial<TreeProviderProps>;

const AllTheProviders = ({
  children,
  settings = { ...defaultSettings },
  translate = { x: 0, y: 0 }, // Provide default value for translate if not provided
  dimensions = { width: 300, height: 400 }, // Provide default value for dimensions if not provided
  setTranslate = () => {}, // Provide a no-op function for setTranslate if not provided
}: AllTheProvidersProps) => {
  return (
    <SettingsProvider>
      <WindowProvider>
        <TreeProvider
          settings={settings}
          translate={translate}
          dimensions={dimensions}
          setTranslate={setTranslate}
        >
          {children}
        </TreeProvider>
      </WindowProvider>
    </SettingsProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
