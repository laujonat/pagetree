import { useEffect, useState } from "react";

import { useTree } from "@/hooks/useTree";

import { TreeActionsToolbar } from "../tree/TreeActionsToolbar";
import { NodeList } from "./NodeList";

export function NodeListContainer() {
  const { selectedNode } = useTree();
  const { loaded } = useTree();
  const [isNodeListEmpty, setIsNodeListEmpty] = useState(true);

  useEffect(() => {
    console.log(loaded);
    console.log(selectedNode?.children);
    // Update isNodeListEmpty based on changes in the loaded state
    setIsNodeListEmpty(
      !(loaded && selectedNode?.children && selectedNode.children.length > 0)
    );
  }, [loaded, selectedNode?.children]);
  return (
    <>
      <TreeActionsToolbar selectedNode={selectedNode} />
      <div className="nodelist__container">
        <NodeList
          selectedNode={selectedNode}
          isNodeListEmpty={isNodeListEmpty}
        />
      </div>
    </>
  );
}

export default NodeListContainer;
