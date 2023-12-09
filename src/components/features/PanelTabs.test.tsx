import { render } from "@/test.utils";
import { fireEvent } from "@testing-library/react";

import Tabs from "./PanelTabs"; // Import the Tabs component

describe("Tabs", () => {
  it("should render tabs", () => {
    const tabs = [
      { label: "Tab 1", content: "Content 1" },
      { label: "Tab 2", content: "Content 2" },
    ];

    const { getByText } = render(<Tabs tabs={tabs} />);

    expect(getByText("Tab 1")).toBeInTheDocument();
    expect(getByText("Tab 2")).toBeInTheDocument();
  });

  it("should show correct tab content", () => {
    const tabs = [
      { label: "Tab 1", content: "Content 1" },
      { label: "Tab 2", content: "Content 2" },
    ];

    const { getByText } = render(<Tabs tabs={tabs} />);

    expect(getByText("Content 1")).toBeInTheDocument();
    expect(getByText("Content 2")).not.toBeInTheDocument();

    fireEvent.click(getByText("Tab 2"));

    expect(getByText("Content 2")).toBeInTheDocument();
    expect(getByText("Content 1")).not.toBeInTheDocument();
  });

  it("should set active tab style", () => {
    const tabs = [
      { label: "Tab 1", content: "Content 1" },
      { label: "Tab 2", content: "Content 2" },
    ];

    const { getByText } = render(<Tabs tabs={tabs} />);

    expect(getByText("Tab 1")).toHaveClass("active");
    expect(getByText("Tab 2")).not.toHaveClass("active");

    fireEvent.click(getByText("Tab 2"));

    expect(getByText("Tab 2")).toHaveClass("active");
    expect(getByText("Tab 1")).not.toHaveClass("active");
  });
});
