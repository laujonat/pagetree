import { ContextMenuType } from "./types";

export const enum MessageKey {
  action = "action",
  colorScheme = "colorScheme",
}

export const enum ContextMenuId {
  selector = "context-selector",
  page = "context-page",
  element = "context-element",
}

export const enum MessageContent {
  // Content script requests
  activeTabUrl = "current-tab-url-response",
  checkDocStatus = "check-document-status",
  fetchActiveTabUrl = "fetch-current-tab-url",
  reloadActiveTab = "reload-active-tab",
  reloadExtension = "extension-reload-content",
  resendScanPage = "rescan-tree-data",
  scanPage = "extension-scan-page",
  updateGenTree = "update-gentree-state",
  openSidePanel = "open-side-panel",
  treeReady = "document-tree-loaded",
  reloadDomTree = "sync-dom-tree",
  // Script to background
  bgDocStatus = "document-status-response",
  bgFetchActiveTabUrl = "fetch-tab-url",
  // ContextMenu actions
  highlightTextOption = "process-selected-element-context",
  fullPageOption = "process-selected-page-context",
  // Inspector actions
  inspectorSelect = "process-inspector-selected-element",
  inspectorBadgeActivate = "inspector-badge-activate",
  inspectorBadgeDeactivate = "inspector-badge-deactivate",
  inspectorToggle = "script-toggle-inspector",
  inspectorStatus = "extension-inspector-status",
  //   updateGenTree = "update-gentree-state",
  inspectorForceStop = "definite-stop-inspector",
  colorScheme = "colorSchemes",
  checkFirstTime = "check-first-time-colorschema",
  firstTimeResponse = "first-time-colorschema-response",
}

export const enum MessageTarget {
  Sidepanel = "sidepanel",
  Background = "background",
  Runtime = "runtime",
}

export const enum MessageFrom {
  Content,
  Context,
}

export const contexts: ContextMenuType[] = [
  "selection",
  "link",
  "editable",
  "image",
  "video",
  "audio",
];
