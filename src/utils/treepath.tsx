import { HierarchyPointNode, select } from "d3";
import Tree, { CustomNodeElementProps, TreeNodeDatum } from "react-d3-tree";

import { PageTreeHierarchyNode } from "@/types";

interface ForeignObjectProps {
  width: number;
  height: number;
  x: number;
  y: number;
}

/**
 * Sorts SVG path elements in a tree visualization rendered by react-d3-tree.
 *
 * This reorders the paths based on the vertical or horizontal position encoded in the 'd' attribute,
 * depending on the orientation. This enables highlighting a path by index after sorting.
 *
 * @param paths - Array of SVGPathElement objects
 * @param orientation - 'vertical' or 'horizontal'
 * @returns Sorted array of SVGPathElement objects
 */
export function sortPaths(paths, orientation) {
  return paths.sort((a, b) => {
    const aD = a.getAttribute("d");
    const bD = b.getAttribute("d");

    const regex = orientation === "horizontal" ? /V(-?\d+)/ : /H(-?\d+)/;
    const aValueMatch = aD ? aD.match(regex) : null;
    const bValueMatch = bD ? bD.match(regex) : null;

    const aValue = aValueMatch ? parseInt(aValueMatch[1], 10) : 0;
    const bValue = bValueMatch ? parseInt(bValueMatch[1], 10) : 0;

    return aValue - bValue;
  });
}

/**
 * Sanitizes the given ID by escaping the first digit if it starts with a number.
 * This avoids issues with numeric IDs not being valid CSS selectors.
 *
 * @param id - The ID to sanitize
 * @returns The sanitized ID
 */
export function sanitizeId(id: string) {
  if (/^\d/.test(id)) {
    // Correctly escape the first digit
    return `\\3${id[0]} ${id.slice(1)}`;
  } else {
    return id;
  }
}

/**
 * Recursively collapses the given node and all of its descendants in the tree.
 * Sets the `__rd3t.collapsed` property on the nodes to collapse them.
 */
export function collapseNodeDescendants(node: TreeNodeDatum) {
  node.__rd3t.collapsed = true;
  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      // If the child is not already collapsed, collapse it
      if (!child.__rd3t.collapsed) {
        Tree.collapseNode(child);
        collapseNodeDescendants(child); // Recursively collapse its children
      }
    });
  }
}

export function expandNodeDescendants(
  node: PageTreeHierarchyNode<TreeNodeDatum>
) {
  console.log(node);
  // @ts-ignore
  node.__rd3t.collapsed = false;
  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      // If the child is not already collapsed, collapse it
      if (child.__rd3t.collapsed) {
        Tree.expandNode(child);
        expandNodeDescendants(child); // Recursively collapse its children
      }
    });
  }
  console.log("expanidng", node);
  return node;
}

/**
 * Updates the styling of the currently selected node in the tree.
 * Adds the 'link__selected' class to the source and target node elements
 * to highlight them. Also removes that class from any previously
 * selected nodes.
 */
// Target selected node so we can style it
export const updateCurrentNode = (
  source: HierarchyPointNode<TreeNodeDatum>,
  target: HierarchyPointNode<TreeNodeDatum>
) => {
  const previouslySelected = document.querySelectorAll(".link__selected");
  previouslySelected.forEach((el) => el.classList.remove("link__selected"));
  const addClassToNodeElement = (node) => {
    if (node && !node.data.__rd3t.collapsed) {
      const element = document.getElementById(node.data.__rd3t.id);
      if (element instanceof SVGElement) {
        element.classList.add("link__selected");
      }
    }
  };
  addClassToNodeElement(source);
  addClassToNodeElement(target);
};

function wrapTextWithEllipsis(textElement, containerWidth) {
  const self = select(textElement);
  let text = self.text();

  while (
    self.node().getComputedTextLength() > containerWidth * 1.25 &&
    text.length > 0
  ) {
    text = text.slice(0, -1);
    self.text(text + "...");
  }
}
/**
 * Renders a foreignObject SVG node for the given React D3 Tree node props.
 * This allows rendering HTML content inside the SVG tree nodes.
 * The foreignObject is wrapped in a circle element for styling purposes.
 * Clicking the node will toggle its expanded/collapsed state.
 */
export const renderForeignObjectNode = (
  rd3tProps: Partial<CustomNodeElementProps>
) => {
  const foreignObjectProps: ForeignObjectProps = {
    width: 50,
    height: 50,
    x: -25,
    y: -30,
  };
  const { nodeDatum, toggleNode, onNodeClick } =
    rd3tProps as CustomNodeElementProps;

  const handleClick = async (evt) => {
    evt.preventDefault();
    if (!nodeDatum?.__rd3t.collapsed) {
      await Tree.expandNode(nodeDatum as TreeNodeDatum);
    } else {
      toggleNode();
    }
    await collapseNodeDescendants(nodeDatum as TreeNodeDatum);
    // Notify about the node click
    onNodeClick(evt);
    // Expand the node again
    await Tree.expandNode(nodeDatum);
  };

  return (
    <>
      <circle
        onMouseOver={(e) => {
          e.preventDefault();
        }}
        cursor="pointer"
        r={5}
        stroke={
          (nodeDatum?.children as TreeNodeDatum[]).length > 0
            ? "var(--node-border)"
            : "var(--text-color-light)"
        }
        fill={
          (nodeDatum?.children as TreeNodeDatum[]).length > 0
            ? "var(--node)"
            : "var(--leaf)"
        }
      ></circle>
      <defs>
        <filter x="0" y="0" width="1" height="1" id="solid">
          <feFlood floodColor="var(--bg-1)" result="bg" />
          <feMerge>
            <feMergeNode in="bg" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <text
        filter="url(#solid)"
        strokeWidth={0}
        fontFamily="monospace"
        fill="var(--icon-fill)"
        fontWeight={500}
        fontSize="0.75rem"
        textRendering="optimizeLegibility"
        textAnchor="middle" // Center the text horizontally
        alignmentBaseline="middle" // Center the text vertically
        x={0}
        y={-20}
        ref={(textElement) => {
          if (textElement) {
            // Call the wrapTextWithEllipsis function with the text element and container width
            wrapTextWithEllipsis(textElement, foreignObjectProps.width);
          }
        }}
      >
        {`<${nodeDatum.name}>`}
      </text>
      <foreignObject
        {...foreignObjectProps}
        style={{ overflow: "hidden", margin: "0 auto" }}
        onClick={handleClick}
        onMouseDown={(e) => {
          e.preventDefault();
        }}
      ></foreignObject>
    </>
  );
};

export function getForeignObjectElement(id: string): SVGElement {
  const selector = `#${sanitizeId(id)} foreignObject`;
  const foreignObject = document.querySelector(String(selector));
  if (!foreignObject) throw new Error("SvgElementQueryErr..");
  return foreignObject as SVGElement;
}
