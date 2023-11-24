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
