import { useState } from "react";

export function Tabs({ tabs }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <>
      <div className="tabs">
        <div className="tabs__actions">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`tab ${activeIndex === index ? "active" : ""}`}
              onClick={() => setActiveIndex(index)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="tabs__label">{tabs[activeIndex].label}</div>
      </div>
      <div className="panels" style={{ height: "100%" }}>
        {tabs.map((tab, index) => (
          <div
            key={index}
            className={`panel ${activeIndex === index ? "active" : ""}`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </>
  );
}

export default Tabs;
