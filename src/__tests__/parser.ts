import { createTreeNodes } from "../utils/d3node"; // replace with actual file path

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
    expect(createTreeNodes(document.getElementById("parent")!)).toEqual(
      expected
    );
  });
});
