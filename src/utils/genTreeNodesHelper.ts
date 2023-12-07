// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { TreeNodeDatum } from "react-d3-tree";

import { TreeNode } from "../types";

export function createTreeNodes(root: Element): TreeNode {
  return traverseNode(root);

  function traverseNode(
    domElement: Element, // Use Element type for general HTML elements
    parentInfo: {
      parentId: string;
      parentClass: string;
      parentTag: string;
    } = {
      parentId: "",
      parentClass: "",
      parentTag: "",
    },
    childIndex: number = 0
  ): TreeNode {
    const id = domElement?.id;
    const classes = Array.from(domElement?.classList);
    const tagName = domElement.tagName;
    const attributes = createAttributesObject(domElement);
    const children = Array.from(domElement?.children); // Convert HTMLCollection to Array
    const scannedChildren: TreeNode[] = [];

    // for (const attr of Object.values)
    for (let i = 0; i < children.length; i++) {
      scannedChildren.push(
        traverseNode(
          children[i],
          {
            parentId: id || parentInfo.parentId,
            parentClass:
              classes.length > 0 ? classes.join(" ") : parentInfo.parentClass,
            parentTag: tagName.toLowerCase(), // Typically, tag names are lowercased
          },
          i + 1 // childIndex should be 1-based
        )
      );
    }
    //   attributes,
    return {
      tag: tagName.toLowerCase(),
      id: id,
      attrs: attributes,
      classes: classes,
      childIndex: childIndex,
      parentId: parentInfo.parentId,
      parentClass: parentInfo.parentClass,
      parentTag: parentInfo.parentTag,
      children: scannedChildren,
    };
  }

  function createAttributesObject(element) {
    const attributesObj = {};
    Array.from(element.attributes).forEach((attr) => {
      // @ts-ignore dom attributes
      attributesObj[attr.name] = attr.value;
    });
    return attributesObj;
  }
}

export const genTreeData = (node: TreeNode) => {
  const nodeSvgShape = {
    shape: "circle", // or any other shape you prefer
    shapeProps: {
      r: 10,
    },
  };
  return {
    name: node?.tag,
    attrs: node.attrs,
    attributes: {
      id: node.id,
      classes: node.classes,
      parentId: node.parentId,
      parentClass: node.parentClass,
      parentTag: node.parentTag,
      childIndex: node.childIndex, // Use the childIndex from the node
    },
    nodeSvgShape: nodeSvgShape,
    children: node.children ? node.children.map(genTreeData) : [],
  };
};

export const findNodesById = (
  nodeId: string,
  nodeSet: TreeNodeDatum[],
  hits: TreeNodeDatum[]
) => {
  if (hits.length > 0) {
    return hits;
  }
  hits = hits.concat(nodeSet.filter((node) => node.data.__rd3t.id === nodeId));
  nodeSet.forEach((node) => {
    if (node.children && node.children.length > 0) {
      hits = this.findNodesById(nodeId, node.children, hits);
    }
  });
  return hits;
};

export function getDefaultZoom(count) {
  let factor = 1;
  if (count <= 10) return factor;
  if (count < 20) {
    factor = 1;
  } else if (count < 60) {
    factor = 0.55;
  } else if (count < 100) {
    factor = 0.13;
  } else if (count < 200) {
    factor = 0.09;
  } else {
    factor = 0.04;
  }
  return factor;
}
