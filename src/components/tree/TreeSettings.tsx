import { useEffect, useState } from "react";

const SettingsOption = ({ label, options, onChange, active }) => {
  const [activeOption, setActiveOption] = useState(active);

  useEffect(() => {
    setActiveOption(active);
  }, [active]);

  const handleClick = (value) => {
    setActiveOption(value);
    onChange(value);
  };

  return (
    <div className="tree-toolbar">
      <div className="tree-toolbar__left">
        <div className="tree-toolbar__label">{label}</div>
      </div>
      <div className="tree-toolbar__right">
        {options.map((option) => (
          <div
            key={option.value}
            onClick={() => handleClick(option.value)}
            role="button"
            className={`button ${
              activeOption === option.value ? "active" : ""
            }`}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsDropdownOption = ({ label, options, onChange, active }) => {
  const [selectedOption, setSelectedOption] = useState(active);

  useEffect(() => {
    setSelectedOption(active); // Update selected option when active changes
  }, [active]);

  const handleChange = (event) => {
    const value = event.target.value;
    setSelectedOption(value);
    onChange(value);
  };

  return (
    <div className="tree-toolbar">
      <div className="tree-toolbar__left">
        <div className="tree-toolbar__label">{label}</div>
      </div>
      <div className="tree-toolbar__right">
        <select
          className="tree-toolbar__select"
          name="settings"
          id="settings-select"
          value={selectedOption}
          onChange={handleChange}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export function TreeSettings({ settings, updateSetting }) {
  const handleUpdateOrientation = (newOrientation: string) => {
    updateSetting("orientation", newOrientation);
  };

  const handleUpdateShouldCollapseNeighborNodes = (newValue: boolean) => {
    updateSetting("shouldCollapseNeighborNodes", newValue);
  };

  const handleThemeUpdate = (newValue: string) => {
    updateSetting("darkMode", newValue);
  };

  const handleUpdatePathFunc = (newPathFunction: string) => {
    console.log("NEW PATH FUNCTION", newPathFunction);
    console.log(chrome.storage);
    updateSetting("pathFunc", newPathFunction);
  };

  const themeOptions = [
    { label: "Light", value: "disabled" },
    { label: "Dark", value: "enabled" },
  ];

  const orientationOptions = [
    { label: "Horizontal", value: "horizontal" },
    { label: "Vertical", value: "vertical" },
  ];

  const collapseNeighborOptions = [
    { label: "Yes", value: true },
    { label: "No", value: false },
  ];

  const pathFunctionOptions = [
    { label: "Step", value: "step" },
    { label: "Diagonal", value: "diagonal" },
    { label: "Straight", value: "straight" },
    { label: "Elbow", value: "elbow" },
  ];

  return (
    <>
      <section className="tree-settings__container">
        <div>
          <SettingsOption
            label="Extension theme"
            options={themeOptions}
            active={settings.darkMode}
            onChange={handleThemeUpdate}
          />
          <SettingsOption
            label="Tree orientation"
            options={orientationOptions}
            active={settings.orientation}
            onChange={handleUpdateOrientation}
          />
          <SettingsOption
            label="Collapse neighbor nodes"
            active={settings.shouldCollapseNeighborNodes}
            options={collapseNeighborOptions}
            onChange={handleUpdateShouldCollapseNeighborNodes}
          />
          <SettingsDropdownOption
            label="Path Function"
            active={settings.pathFunc}
            options={pathFunctionOptions}
            onChange={handleUpdatePathFunc}
          />
        </div>
        <div>
          <LicenseAndDisclaimer />
        </div>
      </section>
    </>
  );
}
function LicenseAndDisclaimer() {
  return (
    <div className="footer-text">
      <p>
        Pagetree Inspector is based on{" "}
        <a target="_blank" href="https://github.com/ilyashubin/hover-inspect">
          ilyashubin/hover-inspect
        </a>{" "}
        and{" "}
        <a
          target="_blank"
          href="https://github.com/joelsaupe/html-tree-generator__chrome-extension"
        >
          joelsaupe/html-tree-generator
        </a>
        . Icons made from{" "}
        <a target="_blank" href="https://iconduck.com">
          IconDuck
        </a>{" "}
        License by{" "}
        <a target="_blank" href="https://spdx.org/licenses/Apache-2.0.html">
          Apache-2.0
        </a>
        . Icons from{" "}
        <a
          target="_blank"
          href="https://www.figma.com/community/file/1181666037672124687/blueprint-icons?searchSessionId=lpxyy9f9-o7haeghx4cj"
        >
          Blueprint
        </a>{" "}
        made by{" "}
        <a target="_blank" href="https://www.pnnl.gov/">
          Pnnl
        </a>
        . License by{" "}
        <a target="_blank" href="https://spdx.org/licenses/BSD-3-Clause.html">
          BSD-3-Clause
        </a>
        .
      </p>
    </div>
  );
}
