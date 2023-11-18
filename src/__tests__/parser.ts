import { buildTree, getSelectorFromNode, scanPage } from "../parser"; // replace with actual file path

describe("scanPage", () => {
  it("should correctly scan a simple DOM structure", () => {
    // Set up the DOM
    document.body.innerHTML = `
      <div id="parent">
        <span class="child">Child</span>
      </div>
    `;

    // Expected result
    const expected = {
      tag: "div",
      id: "parent",
      classes: [],
      childIndex: 1,
      parentId: "",
      parentClass: "",
      parentTag: "",
      children: [
        {
          tag: "span",
          id: "",
          classes: ["child"],
          childIndex: 1,
          parentId: "parent",
          parentClass: "",
          parentTag: "div",
          children: [],
        },
      ],
    };

    // Test the function
    expect(scanPage(document.getElementById("parent")!)).toEqual(expected);
  });
});

describe("buildTree", () => {
  it("should build HTML tree structure from TreeNode", async () => {
    const treeNode = {
      tag: "div",
      id: "parent",
      classes: [],
      childIndex: 1,
      parentId: "",
      parentClass: "",
      parentTag: "",
      children: [
        {
          tag: "span",
          id: "",
          classes: ["child"],
          childIndex: 1,
          parentId: "parent",
          parentClass: "",
          parentTag: "div",
          children: [],
        },
      ],
    };

    const expectedHtml =
      '<ul><li><input type="checkbox" id="cb-parent-#parent" class="toggle"  style="display:none;"><label for="cb-parent-#parent" class="lbl-toggle node"' +
      ' data-tag="div"' +
      ' data-id="parent"' +
      ' data-class=""' +
      ' data-childcount="1"' +
      ' data-selector="#parent"' +
      " >&lt;div&gt;</label><ul class='collapsible'><li><a class=\"node\"" +
      ' data-tag="span"' +
      ' data-id=""' +
      ' data-class="child"' +
      ' data-childcount="0"' +
      ' data-selector="#parent > span:nth-child(2)"' +
      " >&lt;span&gt;</a></li></ul></li></ul>".replace(/\s/g, "");
    await expect(buildTree(treeNode)).resolves.toEqual(expectedHtml);
  });
});

describe("buildTree", () => {
  it("should build HTML tree structure from TreeNode", async () => {
    // TreeNode structure
    const treeNode = {
      tag: "div",
      id: "parent",
      classes: [],
      childIndex: 1,
      parentId: "",
      parentClass: "",
      parentTag: "",
      children: [
        {
          tag: "span",
          id: "",
          classes: ["child"],
          childIndex: 1,
          parentId: "parent",
          parentClass: "",
          parentTag: "div",
          children: [],
        },
      ],
    };

    // Expected HTML output
    const expectedHtml =
      '<ul><li><a class="node" data-tag="div" data-id="parent" data-class="" data-childcount="1" data-selector="#parent > div:nth-child(1)">&lt;div&gt;</a><ul class=\'collapsible\'><li><a class="node" data-tag="span" data-id="" data-class="child" data-childcount="0" data-selector="#parent > div:nth-child(1) > span:nth-child(1)">&lt;span&gt;</a></li></ul></li></ul>';

    // Test the function
    await expect(buildTree(treeNode)).resolves.toEqual(expectedHtml);
  });
});

describe("getSelectorFromNode", () => {
  it("should generate correct selector for a node", () => {
    const node = {
      tag: "div",
      id: "parent",
      classes: ["class1", "class2"],
      childIndex: 1,
      parentId: "",
      parentClass: "",
      parentTag: "",
    };

    expect(getSelectorFromNode(node)).toEqual("#parent");
  });
});
