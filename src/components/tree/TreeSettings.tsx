import { useState } from "react";

const SettingsOption = ({ label, options, onChange }) => {
  const [activeOption, setActiveOption] = useState(options[0].value);

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

export function TreeSettings({ updateOrientation }) {
  //   const { loaded, selectedNode, treeRef, updateTreeState } = useTree();

  const orientationOptions = [
    { label: "Horizontal", value: "horizontal" },
    { label: "Vertical", value: "vertical" },
  ];

  const collapseNeighborOptions = [
    { label: "Yes", value: 1 },
    { label: "No", value: 0 },
  ];

  return (
    <>
      <SettingsOption
        label="Orientation"
        options={orientationOptions}
        onChange={updateOrientation}
      />
      <SettingsOption
        label="Collapse neighbor nodes"
        options={collapseNeighborOptions}
        onChange={updateOrientation}
      />
      {/* <SettingsOption
        label="Path Function"
        options={pathFunctionOptions}
        onChange={updatePathFunction}
      /> */}
    </>
  );
}
