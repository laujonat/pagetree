import { useEffect, useState } from "react";

type Options = "enabled" | "disabled";

export function Header() {
  const [isDarkMode, setIsDarkMode] = useState<Partial<Options>>();

  const handleToggleDarkMode = () => {
    const newDarkMode = isDarkMode === "enabled" ? "disabled" : "enabled";
    chrome.storage.sync.set({ darkMode: newDarkMode }).then(() => {
      setIsDarkMode(newDarkMode);
      document.body.classList.toggle("dark-mode", newDarkMode === "enabled");
    });
  };

  useEffect(() => {
    chrome.storage.sync.get(["darkMode"]).then((result) => {
      const mode = result.darkMode === "enabled" ? "enabled" : "disabled";
      setIsDarkMode(mode);
      document.body.classList.toggle("dark-mode", mode === "enabled");
    });
  }, []);

  return (
    <header className="header">
      <section className="header__heading">
        <div> </div>
      </section>
      <section className="header__heading-events">
        <div className="switch js-switch">
          <input
            type="checkbox"
            checked={isDarkMode === "enabled"}
            className="switch__checkbox js-switch__checkbox"
            id="switch__checkbox"
            onChange={handleToggleDarkMode}
          />
          <label className="switch__slider" htmlFor="switch__checkbox"></label>
        </div>
      </section>
    </header>
  );
}

export default Header;
