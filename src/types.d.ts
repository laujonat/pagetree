import { MutableRefObject } from "react";
import { RawNodeDatum, TreeNodeDatum } from "react-d3-tree";

interface TreeNode extends RawNodeDatum {
  tag?: string;
  id?: string;
  classes?: Array<string>;
  childIndex?: number;
  parentId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attrs?: any;
  parentClass?: string;
  parentTag?: string;
  children?: Array<TreeNode>;
}

interface TreeHierarchyNode extends TreeNode {
  data: TreeNodeDatum;
}

interface RefHandler {
  ref: MutableRefObject<HTMLElement>;
  handler: (event: MouseEvent) => void;
}

interface Point {
  x: number;
  y: number;
}

interface Dimension {
  width: number;
  height: number;
}

// Message passing type safety
type ContentTargetType = "runtime" | "background";

interface IMessage {
  target: "sidepanel" | "popup";
  action: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

interface IRelayMessageOptions {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  target?: string;
}
