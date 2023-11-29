import { TreeNode } from "./types";

export function scanPage(root: Element): TreeNode {
  return _scanElement(root);

  function _scanElement(
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
    const id = domElement.id;
    const classes = Array.from(domElement.classList);
    const tagName = domElement.tagName;
    const attributes = createAttributesObject(domElement);
    const children = Array.from(domElement.children); // Convert HTMLCollection to Array
    const scannedChildren: TreeNode[] = [];

    // for (const attr of Object.values)
    for (let i = 0; i < children.length; i++) {
      scannedChildren.push(
        _scanElement(
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
      name: tagName.toLowerCase(),
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
      // @ts-ignore
      attributesObj[attr.name] = attr.value;
    });
    return attributesObj;
  }
}

// Define buildTree and getSelectorFromNode inside or outside the component
export async function buildTree(root: TreeNode) {
  const tree = new Promise((resolve) =>
    resolve("<ul>" + _buildNode(root, "", "", "") + "</ul>")
  );

  function _buildNode(
    node: TreeNode,
    parentId: string,
    parentClass: string,
    parentTag: string
  ): string {
    let nodeString = "<li>";
    // Generate a selector for the current node
    const selector = getSelectorFromNode({
      tag: String(node.tag),
      id: node.id,
      classes: node.classes,
      parentId: parentId,
      parentClass: parentClass,
      parentTag: parentTag,
      childIndex: Number(node.childIndex), // Use the childIndex from the node
    });

    // Children in <head> are all leaf nodes.
    // We show <head> collapsed to reduce vertical space when window loads.
    const isHeadTag = (node?.tag as string).toLowerCase() === "head";
    const checkedAttribute = isHeadTag ? "checked='checked'" : "";

    if (node.children && node.children.length > 0) {
      nodeString += `<input type="checkbox" id="cb-${node.id}-${selector}" class="toggle" ${checkedAttribute} style="display:none;">`;

      nodeString += `<label for="cb-${
        node.id
      }-${selector}" class="lbl-toggle node"
          data-tag="${(node?.tag as string).toLowerCase()}"
          data-id="${node.id || ""}"
          data-class="${
            (node.classes as []).length ? (node.classes as []).join(".") : ""
          }"
          data-childcount="${node.children.length}"
          data-selector="${selector}"
        >&lt;${(node?.tag as string).toLowerCase()}&gt;</label>`;
      nodeString += "<ul class='collapsible'>";
    } else {
      // For non-collapsible nodes, just use the <a> tag without the checkbox
      nodeString += `<a class="node"
          data-tag="${(node?.tag as string).toLowerCase()}"
          data-id="${node.id || ""}"
          data-class="${
            (node.classes as []).length ? (node.classes as []).join(".") : ""
          }"
          data-childcount="${node.children ? node.children.length : 0}"
          data-selector="${selector}"
        >&lt;${(node?.tag as string).toLowerCase()}&gt;</a>`;
    }

    if (node.children && node.children.length > 0) {
      for (let i = 0; i < node.children.length; i++) {
        nodeString += _buildNode(
          node.children[i],
          String(node?.id),
          (node.classes as []).join(" "),
          (node?.tag as string).toLowerCase()
        );
      }
      nodeString += "</ul>";
    }
    nodeString += "</li>";
    return nodeString;
  }
  return tree;
}

/**
 * Generates a CSS selector for a node based on its tag, id, and classes.
 * @param {TreeNode} node - The node object.
 * @return {string} The CSS selector for the node.
 */
export function getSelectorFromNode(node: {
  tag: string;
  id?: string;
  classes?: Array<string>;
  parentId?: string;
  parentClass?: string;
  parentTag?: string;
  childIndex: number;
}): string {
  if (node.id) {
    return "#" + node.id;
  }

  // Build selector from parent's information and child index
  let parentSelector = "";
  if (node.parentId) {
    parentSelector = "#" + node.parentId + " > ";
  } else if (node.parentClass) {
    parentSelector = "." + node.parentClass.split(" ").join(".") + " > ";
  }

  let selector = parentSelector + (node?.tag as string).toLowerCase();

  // Use :nth-child() for specificity if childIndex is provided
  if (node.childIndex !== null) {
    selector += `:nth-child(${node.childIndex + 1})`;
  }

  return selector;
}

export const convertToD3Format = (node: TreeNode) => {
  const nodeSvgShape = {
    shape: "circle", // or any other shape you prefer
    shapeProps: {
      r: 10,
    },
  };
  return {
    name: node.tag,
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
    children: node.children ? node.children.map(convertToD3Format) : [],
  };
};
