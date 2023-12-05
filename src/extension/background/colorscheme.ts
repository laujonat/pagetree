import { MessageKey, MessageTarget } from "../../constants";

const setColorScheme = (perfersDark: boolean) => {
  console.log(perfersDark);
  void chrome.runtime.sendMessage({
    action: MessageKey.colorScheme,
    target: MessageTarget.Sidepanel,
    data: perfersDark ? "enabled" : "disabled",
  });
};

const perfersDark = window.matchMedia("(prefers-color-scheme: dark)");

setColorScheme(perfersDark.matches);

perfersDark.addEventListener("change", ({ matches }) => {
  setColorScheme(matches);
});
