/* eslint-disable @typescript-eslint/no-explicit-any */
import Prism from "prismjs";

import { MessageContent, MessageTarget } from "../../constants";

// This code builds on top of:
// https://github.com/ilyashubin/hover-inspect/blob/master/app/hoverinspect.js
export class Inspector {
  $target: HTMLElement;
  $cacheEl: HTMLElement;
  $cacheElMain: HTMLElement;
  serializer: XMLSerializer;
  forbidden: any[];
  $host!: HTMLElement;
  template!: string;
  $wrap: any;
  $code: any;
  $canvas: any;
  c: any;
  width!: number;
  height!: number;
  stringified: any;
  private isActive: boolean;

  constructor() {
    this.highlight = this.highlight.bind(this);
    this.log = this.log.bind(this);
    this.codeOutput = this.codeOutput.bind(this);
    this.layout = this.layout.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.isActive = false;

    this.$target = document.body;
    this.$cacheEl = document.body;
    this.$cacheElMain = document.body;

    this.serializer = new XMLSerializer();
    this.forbidden = [this.$cacheEl, document.body, document.documentElement];
  }

  getNodes() {
    const path = chrome.runtime.getURL("template.html");

    fetch(path)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((text) => {
        this.template = text;
        this.createNodes();
        this.registerEvents();
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  }

  createNodes() {
    this.$host = document.createElement("div");
    this.$host.className = "tl-host";
    this.$host.style.cssText = "all: initial;";

    const shadow = this.$host.attachShadow({ mode: "open" });
    document.body.appendChild(this.$host);

    const templateMarkup: HTMLDivElement = document.createElement("div");
    if (templateMarkup && templateMarkup instanceof HTMLDivElement) {
      templateMarkup.innerHTML = this.template;
      shadow.innerHTML = (
        templateMarkup.querySelector("template") as HTMLElement
      ).innerHTML;
    }
    this.$wrap = shadow.querySelector(".tl-wrap");
    this.$code = shadow.querySelector(".tl-code");

    this.$canvas = shadow.querySelector("#tl-canvas");
    this.c = this.$canvas.getContext("2d");
    this.width = this.$canvas.width = window.innerWidth;
    this.height = this.$canvas.height = window.innerHeight;

    this.highlight();
  }

  selectElement(e) {
    if (e.target instanceof HTMLElement) {
      // Extract information from the element
      const elementInfo = {
        tagName: e.target.tagName,
        id: e.target.id,
        classes: e.target.className,
        // You can add more properties as needed
      };

      // Send this information to the background script or elsewhere
      chrome.runtime.sendMessage({
        action: MessageContent.inspectorSelect,
        data: elementInfo,
        target: MessageTarget.Background,
      });
    }
  }

  registerEvents() {
    document.addEventListener("mousemove", this.log);
    document.addEventListener("click", this.selectElement);
    document.addEventListener("scroll", this.layout);
    window.addEventListener("resize", () => {
      this.handleResize();
      this.layout();
    });
  }

  log(e) {
    this.$target = e.target;

    // check if element cached
    if (this.forbidden.indexOf(this.$target) !== -1) return;

    this.stringified = this.serializer.serializeToString(this.$target);

    this.codeOutput();

    this.$cacheEl = this.$target;
    this.layout();
  }

  codeOutput() {
    if (this.$cacheElMain === this.$target) return;
    this.$cacheElMain = this.$target;

    const fullCode = this.stringified
      .slice(0, this.stringified.indexOf(">") + 1)
      .replace(/ xmlns="[^"]*"/, "");

    this.$code.innerText = fullCode; // set full element code
    this.highlight(); // highlight element
  }

  // redraw overlay
  layout() {
    const c = this.c;

    const rect = this.$target.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(this.$target);
    const box = {
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
      margin: {
        top: computedStyle.marginTop,
        right: computedStyle.marginRight,
        bottom: computedStyle.marginBottom,
        left: computedStyle.marginLeft,
      },
      padding: {
        top: computedStyle.paddingTop,
        right: computedStyle.paddingRight,
        bottom: computedStyle.paddingBottom,
        left: computedStyle.paddingLeft,
      },
    };

    // pluck negatives
    ["margin", "padding"].forEach(function (property) {
      for (const el in box[property]) {
        const val = parseInt(box[property][el], 10);
        box[property][el] = Math.max(0, val);
      }
    });

    c.clearRect(0, 0, this.width, this.height);

    box.left = Math.floor(box.left) + 1.5;
    box.width = Math.floor(box.width) - 1;

    let x, y, width, height;

    // margin
    x = box.left - parseInt(box.margin.left, 10);
    y = box.top - parseInt(box.margin.top, 10);
    width = box.width + box.margin.left + box.margin.right;
    height = box.height + box.margin.top + box.margin.bottom;

    c.fillStyle = "rgba(255,165,0,0.5)";
    c.fillRect(x, y, width, height);

    // padding
    x = box.left;
    y = box.top;
    width = box.width;
    height = box.height;

    c.fillStyle = "rgba(158,113,221,0.5)";
    c.clearRect(x, y, width, height);
    c.fillRect(x, y, width, height);

    // content
    x = box.left + box.padding.left;
    y = box.top + box.padding.top;
    width =
      box.width -
      parseInt(box.padding.right, 10) -
      parseInt(box.padding.left, 10);
    height =
      box.height -
      parseInt(box.padding.bottom, 10) -
      parseInt(box.padding.top, 10);

    c.fillStyle = "rgba(73,187,231,0.25)";
    c.clearRect(x, y, width, height);
    c.fillRect(x, y, width, height);

    // rulers (horizontal - =)
    x = -10;
    y = Math.floor(box.top) + 0.5;
    width = this.width + 10;
    height = box.height - 1;

    c.beginPath();
    c.setLineDash([10, 3]);
    c.fillStyle = "rgba(0,0,0,0.02)";
    c.strokeStyle = "rgba(13, 139, 201, 0.45)";
    c.lineWidth = 1;
    c.rect(x, y, width, height);
    c.stroke();
    c.fill();

    // rulers (vertical - ||)
    x = box.left;
    y = -10;
    width = box.width;
    height = this.height + 10;

    c.beginPath();
    c.setLineDash([10, 3]);
    c.fillStyle = "rgba(0,0,0,0.02)";
    c.strokeStyle = "rgba(13, 139, 201, 0.45)";
    c.lineWidth = 1;
    c.rect(x, y, width, height);
    c.stroke();
    c.fill();
  }

  handleResize() {
    this.width = this.$canvas.width = window.innerWidth;
    this.height = this.$canvas.height = window.innerHeight;
  }

  get target() {
    return this.$target;
  }

  // code highlighting
  highlight() {
    Prism.highlightElement(this.$code);
  }

  activate() {
    this.getNodes();
    this.isActive = true;
  }

  deactivate() {
    chrome.runtime.sendMessage({
      action: MessageContent.inspectorBadgeDeactivate,
      target: MessageTarget.Background,
    });
    this.$wrap.classList.add("-out");
    document.removeEventListener("click", this.selectElement);
    document.removeEventListener("mousemove", this.log);
    if (this.$host) {
      setTimeout(() => {
        document.body.removeChild(this.$host);
      }, 600);
    }
    this.isActive = false;
  }

  public get isActiveStatus(): boolean {
    return this.isActive;
  }
}

// const _Inspector = new Inspector();
export default Inspector;
