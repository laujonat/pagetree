import { createContext, ReactNode, useEffect, useState } from "react";
import { TreeProps } from "react-d3-tree";

interface ISettings extends Partial<TreeProps> {}

export interface SettingsContextType {
  settings: ISettings;
  updateSetting: (key: string, newSettings: Partial<ISettings>) => void;
}

const defaultSettings: ISettings = {
  orientation: "vertical",
  shouldCollapseNeighborNodes: true,
  pathFunc: "step",
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
      setSettings({ ...defaultSettings, ...result.settings });
    });
  }, []);

  const updateSetting = (key: string, value) => {
    // Update settings state
    const newSettings = { ...settings, [key]: value };
    chrome.storage.sync.set({ settings: newSettings }).then(() => {
      setSettings(newSettings);
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};
