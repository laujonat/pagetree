import { createContext, useEffect, useState } from "react";

import { ISettings } from "../../types";

interface ITheme {
  darkMode: string | boolean;
}

export interface SettingsContextType {
  settings: ISettings;
  updateSetting: (key: keyof ISettings, value: ISettings) => void;
}

const defaultSettings: ISettings & ITheme = {
  orientation: "vertical",
  shouldCollapseNeighborNodes: true,
  pathFunc: "step",
  darkMode: "enabled",
};

export const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSetting: () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<ISettings>(defaultSettings);

  useEffect(() => {
    chrome.storage.sync.get(["settings"], (result) => {
      // Ensure that result.settings is of type ISettings
      if (result.settings && typeof result.settings === "object") {
        const updatedSettings: ISettings = {
          ...defaultSettings,
          ...result.settings,
        };
        setSettings(updatedSettings);

        if (updatedSettings.darkMode === "enabled") {
          document.documentElement.setAttribute("data-theme", "dark");
        } else {
          document.documentElement.removeAttribute("data-theme");
        }
      }
    });
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateSetting = (key: keyof ISettings, value: any) => {
    const newSettings = { ...settings, [`${key}`]: value };
    chrome.storage.sync.set({ settings: newSettings }, () => {
      setSettings(newSettings);

      if (key === "darkMode") {
        if (value === "enabled") {
          document.documentElement.setAttribute("data-theme", "dark");
        } else {
          document.documentElement.removeAttribute("data-theme");
        }
      }
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};
