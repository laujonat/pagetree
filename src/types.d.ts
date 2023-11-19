import { MutableRefObject } from "react";

interface TreeNode {
  tag: string;
  id: string;
  classes: Array<string>;
  childIndex: number;
  parentId: string;
  parentClass: string;
  parentTag: string;
  children: Array<TreeNode>;
}

interface RefHandler {
  ref: MutableRefObject<HTMLElement>;
  handler: (event: MouseEvent) => void;
}
