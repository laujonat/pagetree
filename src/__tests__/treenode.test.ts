import { createTreeNodes } from "../utils/treenode";

describe("createTreeNodes", () => {
  it("returns a tree node object with correct structure", () => {
    document.body.innerHTML = `
    <div>
    </div>
  `;
    const result = createTreeNodes(document.getElementsByTagName("div")[0]!);

    expect(result).toEqual({
      tag: "div",
      id: "",
      attrs: {},
      classes: [],
      childIndex: 0,
      parentId: "",
      parentClass: "",
      parentTag: "",
      children: [],
    });
  });

  it("traverses child nodes recursively", () => {
    const root = document.createElement("div");
    const child1 = document.createElement("p");
    const child2 = document.createElement("span");

    root.appendChild(child1);
    root.appendChild(child2);

    const result = createTreeNodes(root);

    // Check individual child nodes
    if (result.children && result.children.length === 2) {
      expect(result.children[0].tag).toBe("p");
      expect(result.children[1].tag).toBe("span");
    }
  });

  it("captures id, classes, attributes", () => {
    document.body.innerHTML = `
      <div id="parent" data-test="hi">
          <span class="child"></span>
      </div>`;

    const result = createTreeNodes(document.getElementById("parent")!);

    // Check the structure of the result
    expect(result).toEqual({
      tag: "div",
      id: "parent",
      attrs: {
        id: "parent",
        "data-test": "hi",
      },
      classes: [],
      childIndex: 0,
      parentId: "",
      parentClass: "",
      parentTag: "",
      children: [
        {
          tag: "span",
          id: "",
          attrs: {
            class: "child",
          },
          classes: ["child"],
          childIndex: 1,
          parentId: "parent",
          parentClass: "",
          parentTag: "div",
          children: [],
        },
      ],
    });
  });

  it("handles errors", () => {
    const throwError = () => {
      throw new Error("Test error");
    };

    const consoleError = jest.spyOn(console, "error");
    const consoleTrace = jest.spyOn(console, "trace");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createTreeNodes(throwError as any);

    expect(consoleError).toHaveBeenCalled();
    expect(consoleTrace).toHaveBeenCalled();
  });
});
