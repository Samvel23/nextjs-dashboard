"use client";

import type { IconButtonProps, SpanProps } from "@chakra-ui/react";
import { ClientOnly, IconButton, Skeleton, Span } from "@chakra-ui/react";
import * as React from "react";
import { LuMoon, LuSun } from "react-icons/lu";

export interface ColorModeProviderProps {
  children: React.ReactNode;
}

export type ColorMode = "light" | "dark";

export interface UseColorModeReturn {
  colorMode: ColorMode;
  setColorMode: (colorMode: ColorMode) => void;
  toggleColorMode: () => void;
}

const colorModeEvent = "color-mode-change";

function applyColorMode(colorMode: ColorMode) {
  document.documentElement.classList.toggle("dark", colorMode === "dark");
  document.documentElement.style.colorScheme = colorMode;
  window.dispatchEvent(new Event(colorModeEvent));
}

function setColorMode(colorMode: ColorMode) {
  applyColorMode(colorMode);
}

function subscribeToColorMode(onChange: () => void) {
  window.addEventListener(colorModeEvent, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(colorModeEvent, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getColorModeSnapshot(): ColorMode {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

const ColorModeContext = React.createContext({ setColorMode });

export function ColorModeProvider({ children }: ColorModeProviderProps) {
  React.useEffect(() => {
    const template = document.querySelector<HTMLTemplateElement>("#theme-init");
    const defaultMode = template?.dataset.defaultMode ?? "system";
    const colorMode =
      defaultMode === "dark" ? "dark" : "light";

    applyColorMode(colorMode);
  }, []);

  return (
    <ColorModeContext.Provider value={{ setColorMode }}>
      {children}
    </ColorModeContext.Provider>
  );
}

export function useColorMode(): UseColorModeReturn {
  const { setColorMode } = React.useContext(ColorModeContext);
  const colorMode = React.useSyncExternalStore(
    subscribeToColorMode,
    getColorModeSnapshot,
    (): ColorMode => "light",
  );
  return {
    colorMode,
    setColorMode,
    toggleColorMode: () =>
      setColorMode(colorMode === "dark" ? "light" : "dark"),
  };
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode();
  return colorMode === "dark" ? dark : light;
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode();
  return colorMode === "dark" ? <LuMoon /> : <LuSun />;
}

interface ColorModeButtonProps extends Omit<IconButtonProps, "aria-label"> {}

export const ColorModeButton = React.forwardRef<
  HTMLButtonElement,
  ColorModeButtonProps
>(function ColorModeButton(props, ref) {
  const { toggleColorMode } = useColorMode();
  return (
    <ClientOnly fallback={<Skeleton boxSize="9" />}>
      <IconButton
        onClick={toggleColorMode}
        variant="ghost"
        aria-label="Toggle color mode"
        size="sm"
        ref={ref}
        {...props}
        css={{
          _icon: {
            width: "5",
            height: "5",
          },
        }}
      >
        <ColorModeIcon />
      </IconButton>
    </ClientOnly>
  );
});

export const LightMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  function LightMode(props, ref) {
    return (
      <Span
        color="fg"
        display="contents"
        className="chakra-theme light"
        colorPalette="gray"
        colorScheme="light"
        ref={ref}
        {...props}
      />
    );
  },
);

export const DarkMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  function DarkMode(props, ref) {
    return (
      <Span
        color="fg"
        display="contents"
        className="chakra-theme dark"
        colorPalette="gray"
        colorScheme="dark"
        ref={ref}
        {...props}
      />
    );
  },
);
