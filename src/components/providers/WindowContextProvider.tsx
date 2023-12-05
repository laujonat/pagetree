import {
  createContext,
  FC,
  MutableRefObject,
  ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react";
import { useClickOutside } from "use-events";

import { MessageContent } from "../../constants";
import useChrome from "../../hooks/useChrome";
import { RefHandler } from "../../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const WindowContext = createContext<any>(null);

interface WindowProviderProps {
  children: ReactNode;
}

const WindowProvider: FC<WindowProviderProps> = ({ children }) => {
  const refsHandlers = useRef<RefHandler[]>([]);
  const { messageToSend, tabId } = useChrome();
  const registerClickOutside = useCallback(
    (
      ref: MutableRefObject<HTMLElement>,
      handler: (event: MouseEvent) => void
    ) => {
      refsHandlers.current.push({ ref, handler });

      return () => {
        refsHandlers.current = refsHandlers.current.filter(
          (rh) => rh.ref !== ref
        );
      };
    },
    []
  );

  useClickOutside(
    refsHandlers.current.map((rh) => rh.ref),
    (event: MouseEvent) => {
      refsHandlers.current.forEach((rh) => {
        if (rh.ref.current && !rh.ref.current.contains(event.target as Node)) {
          rh.handler(event);
        }
      });
    }
  );

  function onUpdateRender() {
    chrome.tabs.query(
      { active: true, lastFocusedWindow: true },
      async (tabs) => {
        const tab = tabs[0]?.id;
        if (tabId || tab) {
          console.log("tabid", tabId);
          messageToSend(
            { action: MessageContent.checkDocStatus },
            tabId || tab
          );
          messageToSend(
            { action: MessageContent.resendScanPage },
            tabId || tab
          );
          messageToSend(
            { action: MessageContent.inspectorStatus },
            tabId || tab
          );
        }
      }
    );
  }

  const onVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      onUpdateRender();
    } else if (document.visibilityState === "hidden") {
      console.log("hidden");
    }
  };

  useLayoutEffect(() => {
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <WindowContext.Provider value={{ registerClickOutside }}>
      {children}
    </WindowContext.Provider>
  );
};

export default WindowProvider;
