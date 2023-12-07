import { MutableRefObject } from "react";
import {
  Orientation,
  PathFunctionOption,
  RawNodeDatum,
  TreeNodeDatum,
} from "react-d3-tree";

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

interface PageTreeHierarchyNode<Datum> {
  data: Datum;
  depth: number;
  height: number;
  parent: MyHierarchyNode<Datum> | null;
  children?: MyHierarchyNode<Datum>[] | undefined;
  value?: number | undefined;
  id?: string | undefined;
  ancestors(): MyHierarchyNode<Datum>[];
  descendants(): MyHierarchyNode<Datum>[];
  leaves(): MyHierarchyNode<Datum>[];
  path(target: MyHierarchyNode<Datum>): MyHierarchyNode<Datum>[];
  links(): Array<HierarchyLink<Datum>>;
  sum(value: (d: Datum) => number): MyHierarchyNode<Datum>;
  count(): MyHierarchyNode<Datum>;
  sort(
    compare: (a: MyHierarchyNode<Datum>, b: MyHierarchyNode<Datum>) => number
  ): MyHierarchyNode<Datum>;
  each(func: (node: MyHierarchyNode<Datum>) => void): MyHierarchyNode<Datum>;
  eachAfter(
    func: (node: MyHierarchyNode<Datum>) => void
  ): MyHierarchyNode<Datum>;
  eachBefore(
    func: (node: MyHierarchyNode<Datum>) => void
  ): MyHierarchyNode<Datum>;
  copy(): MyHierarchyNode<Datum>;
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
