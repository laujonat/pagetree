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
  toggleDark = "toggle-dark-mode",
  updateGenTree = "update-gentree-state",
  openSidePanel = "open-side-panel",
  treeReady = "document-tree-loaded",
  // Script to background
  bgDocStatus = "document-status-response",
  bgFetchActiveTabUrl = "fetch-tab-url",
  // ContextMenu actions
  highlightTextOption = "process-selected-element-context",
  fullPageOption = "process-selected-page-context",
  // Inspector actions
  inspectorSelect = "process-inspector-selected-element",
  inspectorToggle = "script-toggle-inspector",
  inspectorStatus = "extension-inspector-status",
  //   updateGenTree = "update-gentree-state",
  inspectorForceStop = "definite-stop-inspector",
  colorScheme = "colorSchemes",
}

type ActionMappings = {
  [key in MessageKey]: Partial<Record<MessageContent, string>>;
};

export const MessageAction: ActionMappings = {
  [MessageKey.action]: {
    [MessageContent.activeTabUrl]: MessageContent.activeTabUrl,
    [MessageContent.bgDocStatus]: MessageContent.bgDocStatus,
    [MessageContent.bgFetchActiveTabUrl]: MessageContent.bgFetchActiveTabUrl,
    [MessageContent.checkDocStatus]: MessageContent.checkDocStatus,
    [MessageContent.colorScheme]: MessageContent.colorScheme,
    [MessageContent.fetchActiveTabUrl]: MessageContent.fetchActiveTabUrl,
    [MessageContent.fullPageOption]: MessageContent.fullPageOption,
    [MessageContent.highlightTextOption]: MessageContent.highlightTextOption,
    [MessageContent.inspectorForceStop]: MessageContent.inspectorForceStop,
    [MessageContent.inspectorSelect]: MessageContent.inspectorSelect,
    [MessageContent.inspectorStatus]: MessageContent.inspectorStatus,
    [MessageContent.inspectorToggle]: MessageContent.inspectorToggle,
    [MessageContent.openSidePanel]: MessageContent.openSidePanel,
    [MessageContent.reloadExtension]: MessageContent.reloadExtension,
    [MessageContent.resendScanPage]: MessageContent.resendScanPage,
    [MessageContent.scanPage]: MessageContent.scanPage,
    [MessageContent.toggleDark]: MessageContent.toggleDark,
    [MessageContent.updateGenTree]: MessageContent.updateGenTree,
  },
  [MessageKey.colorScheme]: {
    [MessageContent.colorScheme]: MessageContent.colorScheme,
  },
};

export const enum MessageTarget {
  Sidepanel = "sidepanel",
  Background = "background",
  Runtime = "runtime",
}

export const enum MessageFrom {
  Content,
  Context,
}
