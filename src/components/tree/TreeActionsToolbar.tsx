import { forwardRef, useEffect } from "react";
import { TreeNodeDatum } from "react-d3-tree";

import { MessageContent } from "@/constants";
import { useChrome } from "@/hooks/useChrome";
import { useTree } from "@/hooks/useTree";
import { ExpandAllIcon, InspectorIcon, SyncTree } from "@/icons";
import { PageTreeHierarchyNode } from "@/types";

interface TreeActionsToolbarProps {
  selectedNode?: PageTreeHierarchyNode<TreeNodeDatum>;
}

export const TreeActionsToolbar = forwardRef<
  HTMLDivElement,
  TreeActionsToolbarProps
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
>((props: TreeActionsToolbarProps, ref) => {
  const { messageToSend, isInspectorActive, tabUrl } = useChrome();
  const { expandAllNodes } = useTree();

  useEffect(() => {
    console.log("is inspector active", isInspectorActive);
  }, [isInspectorActive]);

  const handleInspectorClick = async () => {
    try {
      messageToSend({
        action: MessageContent.inspectorToggle,
      });
    } catch (error) {
      console.error("Error in handleClick:", error);
    }
  };

  const handleSyncTreeClick = () => {
    try {
      messageToSend({
        action: MessageContent.reloadDomTree,
      });
    } catch (error) {
      console.error("Error in handleClick:", error);
    }
  };

  return (
    <div className="tree-actions">
      <div className="tree-actions__left">
        <div
          className={`tree-actions__action toggle-inspector ${
            isInspectorActive ? "active" : ""
          }`}
        >
          <button aria-label="Toggle inspector" onClick={handleInspectorClick}>
            <InspectorIcon />
          </button>
        </div>
        <div className="tree-actions__action expand-elements">
          <button aria-label="Expand tree elements" onClick={expandAllNodes}>
            <ExpandAllIcon />
          </button>
        </div>
        <div className="tree-actions__action synctree">
          <button aria-label="Refresh DOM tree" onClick={handleSyncTreeClick}>
            <SyncTree />
          </button>
        </div>
      </div>
      <div className="tree-actions__right">
        <p>{tabUrl}</p>
      </div>
    </div>
  );
});
