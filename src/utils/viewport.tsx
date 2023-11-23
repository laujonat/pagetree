interface ViewportInfo {
  isInViewport: boolean;
  translateX: number;
  translateY: number;
}

export function isElementInViewportWithZoom(
  el: SVGElement,
  container: SVGElement,
  zoom: number
): ViewportInfo | false {
  if (!el || !container || zoom <= 0) {
    return false;
  }

  // Get the bounding rectangle of the element and the container
  const containerRect = container.getBoundingClientRect();
  const elementRect = el.getBoundingClientRect();

  // Calculate the visible area within the container considering zoom
  const visibleWidth = (containerRect.width / 2) * zoom;
  const visibleHeight = (containerRect.height / 2) * zoom;
  console.log("visibleWidth", visibleWidth);
  console.log("visibleHeight", visibleHeight);

  // Calculate the center point of the element
  const elementCenterX = elementRect.left + elementRect.width;
  const elementCenterY = elementRect.top + elementRect.height;

  // Check if the element's center point is within the visible area
  const isCenterXInViewport =
    elementCenterX >= containerRect.left &&
    elementCenterX <= containerRect.left + visibleWidth;
  const isCenterYInViewport =
    elementCenterY >= containerRect.top &&
    elementCenterY <= containerRect.top + visibleHeight;

  // The element is in the viewport if both horizontal and vertical centers are visible
  const isInViewport = isCenterXInViewport && isCenterYInViewport;

  // Calculate the necessary translation to center the element in the viewport

  let translateX = 0;
  let translateY = 0;

  console.log(isCenterXInViewport, elementCenterX, containerRect.left);
  if (!isCenterXInViewport) {
    if (elementCenterX < containerRect.left) {
      // Element is to the left of the viewport, move it to the right
      translateX = (containerRect.left - elementCenterX) / zoom;
    } else if (elementCenterX > containerRect.left + visibleWidth) {
      // Element is to the right of the viewport, move it to the left
      translateX = (containerRect.left + visibleWidth - elementCenterX) / zoom;
    }
  }

  if (!isCenterYInViewport) {
    translateY =
      elementCenterY < containerRect.top
        ? containerRect.top - elementCenterY
        : containerRect.top + visibleHeight - elementCenterY;
  }

  return {
    isInViewport,
    translateX,
    translateY,
  };
}
