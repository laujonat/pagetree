import { useRef } from "react";

import { useDraggable } from "@/hooks/useDraggable";
import { useTree } from "@/hooks/useTree";
import { TreeHierarchyNode } from "@/types";

import { TreeActionsToolbar } from "../tree/TreeActionsToolbar";
import { NodeList } from "./NodeList";

function HeaderComponent() {
  const { selectedNode } = useTree();
  const elementContainer = useRef(null);
  useDraggable(elementContainer);

  return (
    <>
      <TreeActionsToolbar
        ref={elementContainer}
        selectedNode={selectedNode as TreeHierarchyNode}
      />
      <div className="details__wrapper">
        <NodeList selectedNode={selectedNode} />
      </div>
    </>
  );
}

export default HeaderComponent;
