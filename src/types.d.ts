import { MutableRefObject } from "react";
import { Orientation, PathFunctionOption, RawNodeDatum, TreeNodeDatum } from "react-d3-tree";

import { MessageContent, MessageTarget } from "./constants";

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

export type TreeComponentRef = {
  svgInstanceRef: string | null;
};

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
  target: MessageTarget.Sidepanel | "popup";
  action: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}
type ValueOf<T> = T[keyof T];

interface IRelayMessageOptions {
  type: ValueOf<MessageContent>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  target?: MessageTarget;
}

type ContextType =
  | "all"
  | "page"
  | "frame"
  | "selection"
  | "link"
  | "editable"
  | "image"
  | "video"
  | "audio"
  | "launcher"
  | "browser_action"
  | "page_action"
  | "action";

// contexts.ts
// contexts.ts
export type ContextMenuType =
  | "selection"
  | "link"
  | "editable"
  | "image"
  | "video"
  | "audio";

interface ISettings {
  orientation: Orientation | undefined;
  shouldCollapseNeighborNodes: boolean;
  pathFunc: PathFunctionOption;
  darkMode: string;
}
