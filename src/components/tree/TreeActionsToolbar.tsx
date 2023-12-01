import { forwardRef, useEffect, useState } from "react";

import useChrome from "../../hooks/useChrome";
import { TreeHierarchyNode } from "../../types";

interface TreeActionsToolbarProps {
  selectedNode: TreeHierarchyNode;
}

export const TreeActionsToolbar = forwardRef<
  HTMLDivElement,
  TreeActionsToolbarProps
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
>((props: TreeActionsToolbarProps, ref) => {
  const { messageToSend } = useChrome();
  const [isInspectorActive, setIsInspectorActive] = useState<boolean>(false);
  useEffect(() => {
    chrome.tabs.query(
      { active: true, lastFocusedWindow: true },
      async (tabs) => {
        const tabId = tabs[0]?.id;
        if (tabId) {
          messageToSend(
            {
              action: "extension-inspector-status",
            },
            tabId
          );
        }
      }
    );
  }, []);

  useEffect(() => {
    const handleMessage = async (message) => {
      console.log("handling message from content", message);
      if (message.target === "runtime") {
        if (message.action === "onload-script-inspector-status") {
          const { active } = message.data;

          console.log(
            "🚀 ------------------------------------------------------------------------🚀"
          );
          console.log(
            "🚀 ⚛︎ file: TreeActionsToolbar.tsx:30 ⚛︎ handleMessage ⚛︎ active:",
            active
          );
          console.log(
            "🚀 ------------------------------------------------------------------------🚀"
          );

          setIsInspectorActive(active);
        }
      }
      return true;
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [setIsInspectorActive]);

  const handleInspectorClick = async () => {
    try {
      const message = await messageToSend({
        action: "script-toggle-inspector",
      });
      setIsInspectorActive(!isInspectorActive); // Toggle the inspector status

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
        <div
          className={`tree-selector__action toggle-inspector ${
            isInspectorActive ? "active" : ""
          }`}
        >
          <button aria-label="Toggle inspector" onClick={handleInspectorClick}>
            <InspectorIcon />
          </button>
        </div>
        <div className="tree-selector__action expand-elements">
          <button aria-label="Expand tree elements">
            <ExpandAllIcon />
          </button>
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
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#a)">
        <path
          d="M5 9v7m0-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm.5 14a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm13 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM5.13 9a4.058 4.058 0 0 0 3.94 3.04l3.43-.01a5.989 5.989 0 0 1 5.67 4.01"
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
