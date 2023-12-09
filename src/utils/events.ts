export const nodeClickEvent = new MouseEvent("click", {
  view: window,
  bubbles: true,
  cancelable: true,
});

export const pathMouseEnterEvent: MouseEvent = new MouseEvent("mouseenter", {
  bubbles: true,
  cancelable: true,
});

export const pathMouseOutEvent: MouseEvent = new MouseEvent("mouseleave", {
  bubbles: true,
  cancelable: true,
});
