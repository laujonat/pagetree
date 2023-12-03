import { createContext, ReactNode, useEffect, useState } from "react";
import { TreeProps } from "react-d3-tree";

interface ISettings extends Partial<TreeProps> {}

interface ITheme {
  darkMode: string | boolean;
}

export interface SettingsContextType {
  settings: ISettings;
  updateSetting: (key: string, newSettings: Partial<ISettings>) => void;
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

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<ISettings>(defaultSettings);

  useEffect(() => {
    chrome.storage.sync.get(["settings"]).then((result) => {
      const updatedSettings = { ...defaultSettings, ...result.settings };
      setSettings(updatedSettings);
      if (updatedSettings.darkMode === "enabled") {
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
    });
  }, []);

  const updateSetting = (key: string, value) => {
    // Update settings state
    const newSettings = { ...settings, [key]: value };
    chrome.storage.sync.set({ settings: newSettings }).then(() => {
      setSettings(newSettings);
      if (key === "darkMode") {
        document.documentElement.setAttribute(
          "data-theme",
          value === "enabled" ? "dark" : ""
        );
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};
