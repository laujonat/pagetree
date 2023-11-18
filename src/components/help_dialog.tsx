import { useContext, useEffect, useRef, useState } from "react";

import { WrapperContext } from "./popup_context";

function HelpDialog() {
  const [visible, setVisible] = useState<boolean>(false);
  const { registerClickOutside } = useContext(WrapperContext);
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const handleClickOutside = (event: MouseEvent) => {
    if (visible) setVisible(false);
  };

  useEffect(() => {
    // Register the click outside handler
    const unregister = registerClickOutside(ref1, handleClickOutside);
    registerClickOutside(ref2, handleClickOutside);

    return () => {
      // Cleanup on unmount
      unregister();
    };
  }, [visible, registerClickOutside]);

  const handleClick = (e: React.MouseEvent) =>
    setVisible((prevVisible) => !prevVisible);

  return (
    <>
      <div
        id="help-icon"
        role="button"
        tabIndex={0}
        style={{
          position: "fixed",
          bottom: "1em",
          right: "1em",
          cursor: "pointer",
        }}
        onClick={handleClick}
        ref={ref1}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30px"
          height="30px"
          fill="var(--icon-fill)"
          viewBox="0 0 50 50"
          version="1.1"
        >
          <g id="surface1">
            <path
              style={{ stroke: "none", fillRule: "nonzero", fillOpacity: 1 }}
              d="M 25 6.25 C 14.644531 6.25 6.25 14.644531 6.25 25 C 6.25 35.355469 14.644531 43.75 25 43.75 C 35.355469 43.75 43.75 35.355469 43.75 25 C 43.75 14.644531 35.355469 6.25 25 6.25 Z M 24.984375 14.453125 C 26.773438 14.453125 28.230469 14.96875 29.351562 15.996094 C 30.472656 17.007812 31.039062 18.300781 31.039062 19.882812 C 31.039062 20.570312 30.847656 21.265625 30.472656 21.972656 C 30.097656 22.675781 29.769531 23.179688 29.472656 23.484375 C 29.199219 23.769531 28.800781 24.144531 28.289062 24.601562 L 28.144531 24.742188 C 26.945312 25.792969 26.339844 26.839844 26.339844 27.886719 L 26.339844 29.027344 L 23.566406 29.027344 L 23.566406 27.6875 C 23.566406 26.832031 23.757812 26.097656 24.132812 25.488281 C 24.503906 24.859375 25.164062 24.121094 26.109375 23.285156 C 26.640625 22.808594 27.011719 22.457031 27.230469 22.226562 C 27.464844 21.980469 27.691406 21.648438 27.910156 21.226562 C 28.144531 20.789062 28.265625 20.339844 28.265625 19.882812 C 28.265625 19.007812 27.964844 18.304688 27.375 17.769531 C 26.804688 17.238281 26.007812 16.964844 24.984375 16.964844 C 23.292969 16.964844 22.128906 17.882812 21.5 19.710938 L 18.960938 18.683594 C 19.375 17.597656 20.089844 16.625 21.09375 15.765625 C 22.117188 14.890625 23.410156 14.453125 24.984375 14.453125 Z M 24.953125 31.660156 C 25.523438 31.660156 25.996094 31.855469 26.371094 32.234375 C 26.765625 32.617188 26.960938 33.066406 26.960938 33.601562 C 26.960938 34.132812 26.765625 34.59375 26.371094 34.976562 C 25.996094 35.359375 25.523438 35.546875 24.953125 35.546875 C 24.382812 35.546875 23.902344 35.359375 23.507812 34.976562 C 23.136719 34.59375 22.949219 34.132812 22.949219 33.601562 C 22.949219 33.066406 23.136719 32.617188 23.507812 32.234375 C 23.902344 31.855469 24.382812 31.660156 24.953125 31.660156 Z M 24.953125 31.660156 "
            />
          </g>
        </svg>
      </div>
      {visible && (
        <div
          ref={ref2}
          id="help-dialog"
          style={{
            background: "var(--bg-0)",
            position: "fixed",
            bottom: "3rem",
            right: "2rem",
            width: "200px",
            cursor: "pointer",
            padding: "10px",
            borderRadius: "var(--border-radius)",
          }}
        >
          {" "}
          Drag the viewport with left click.
          <br />
          <br />
          Hold down the middle mouse button and move pointer the direction you
          would like to scroll the viewport.
        </div>
      )}
    </>
  );
}

export default HelpDialog;
