import { ContextMenuId, contexts } from "@/constants";

export const getMenuOptions = (details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.runtime.setUninstallURL("https://example.com/extension-survey");
  }
  chrome.contextMenus.create({
    title: "Element Selector",
    contexts: ["all"],
    id: ContextMenuId.selector,
  });

  chrome.contextMenus.create({
    title: "Visualize '%s' Element Tree",
    contexts: contexts,
    id: ContextMenuId.element,
  });

  chrome.contextMenus.create({
    title: "Visualize Page Document Tree",
    contexts: ["all"],
    id: ContextMenuId.page,
  });
};

export const createSelector = (info): string => {
  let selector = info.tagName.toLowerCase();
  if (info.id) {
    selector += `#${info.id}`;
  }
  if (info.classes) {
    selector += `.${info.classes.split(" ").join(".")}`;
  }

  return selector;
};
