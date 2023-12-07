import { useTree } from "@/hooks/useTree";

import { TreeActionsToolbar } from "../tree/TreeActionsToolbar";
import { NodeList } from "./NodeList";

export function NodeListContainer() {
  const { selectedNode } = useTree();

  return (
    <>
      <TreeActionsToolbar selectedNode={selectedNode} />
      <div className="nodelist__container">
        <NodeList selectedNode={selectedNode} />
      </div>
    </>
  );
}

export default NodeListContainer;
