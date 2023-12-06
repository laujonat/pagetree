const DEFAULT_COLOR = "#c5221f";
const RECORDING_COLOR = "#44ADF9";

const DEFAULT = "../../assets/icon48.png";
const INSPECTOR_ACTIVE = "../../assets/icon-active.png";
const DISABLED = "../../assets/icon-disabled.png";

export class Badge {
  tab: number;

  constructor(tab: number) {
    this.tab = tab;
  }

  // New method to set the icon and badge
  setIconAndBadge(iconPath: string, badgeText: string, badgeColor: string) {
    // Load the icon image
    fetch(chrome.runtime.getURL(iconPath))
      .then((response) => response.blob())
      .then((blob) => createImageBitmap(blob))
      .then((imageBitmap) => {
        const osc = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
        const ctx = osc.getContext("2d");
        ctx?.drawImage(imageBitmap, 0, 0);
        const imageData = ctx?.getImageData(0, 0, osc.width, osc.height);
        chrome.action.setIcon({ tabId: this.tab, imageData });
      })
      .catch((error) => console.error("Error setting icon:", error));

    // Set the badge text and color
    chrome.action.setBadgeText({ tabId: this.tab, text: badgeText });
    chrome.action.setBadgeBackgroundColor({
      tabId: this.tab,
      color: badgeColor,
    });
  }

  stop(text: string = "") {
    this.setIconAndBadge(DEFAULT, text, DEFAULT_COLOR);
  }

  reset() {
    this.setText("");
  }

  setText(text: string) {
    chrome.action.setBadgeText({ tabId: this.tab, text });
  }

  pause() {
    this.setIconAndBadge(DISABLED, "", DEFAULT_COLOR);
  }

  start() {
    this.setIconAndBadge(INSPECTOR_ACTIVE, "ON", DEFAULT_COLOR);
  }

  wait() {
    this.setIconAndBadge(DEFAULT, "wait", RECORDING_COLOR);
  }
}

export default Badge;
