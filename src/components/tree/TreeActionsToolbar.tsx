import { forwardRef } from "react";

import useChrome from "../../hooks/useChrome";
import { TreeHierarchyNode } from "../../types";
import { DevToolsElement } from "../common/info";

interface TreeActionsToolbarProps {
  selectedNode: TreeHierarchyNode;
}

export const TreeActionsToolbar = forwardRef<
  HTMLDivElement,
  TreeActionsToolbarProps
>((props: TreeActionsToolbarProps, ref) => {
  const { selectedNode } = props;
  const { messageToSend } = useChrome();
  const handleClick = async () => {
    try {
      const message = await messageToSend({
        action: "script-toggle-inspector",
        target: "sidepanel",
      });
      if (message) {
        console.log("Response from content script:", message);
      } else {
        console.log("No response received from content script");
      }
    } catch (error) {
      console.error("Error in handleClick:", error);
    }
  };

  return (
    <div className="tree-selector">
      <div className="tree-selector__left">
        <div className="tree-selector__action">
          <button aria-label="Toggle inspector" onClick={handleClick}>
            <InspectorIcon />
          </button>
        </div>
        <div className="tree-selector__action">
          <button aria-label="Expand tree elements">
            <ExpandAllIcon />
          </button>
        </div>
      </div>
      <div className="tree-selector__right">
        <div className="webkit-element__scrollable" ref={ref}>
          {selectedNode?.data && <DevToolsElement {...selectedNode.data} />}
        </div>
      </div>
    </div>
  );
});

function InspectorIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 22 22"
      fill="none"
      stroke="var(--icon-fill)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
      <path d="m12 12 3 7 1.3-3.3L20 14Z" />
    </svg>
  );
}
function ExpandAllIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#a)">
        <path
          d="M5 9v7M5 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM5.5 22a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM18.5 22a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM5.13 9a4.058 4.058 0 0 0 3.94 3.04l3.43-.01a5.989 5.989 0 0 1 5.67 4.01"
          stroke="var(--icon-fill)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M22.75 6.25h-3v-3A.752.752 0 0 0 19 2.5a.752.752 0 0 0-.75.75v3h-3a.752.752 0 0 0-.75.75c0 .412.338.75.75.75h3v3c0 .412.337.75.75.75s.75-.338.75-.75v-3h3c.413 0 .75-.338.75-.75a.752.752 0 0 0-.75-.75Z"
          fill="var(--icon-fill)"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="var(--icon-fill)" d="M0 0h24v24H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}
