import { createContext, type PropsWithChildren, useContext, useMemo, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { useNativePhoneViewport } from "../nativePhone";
import { mobileAssets } from "./assets";
import { iphoneGeometry, pixelGeometry, type MobileDeviceGeometry } from "./geometry";

export type MobileDeviceId = "iphone" | "pixel-10";

type MobileDevicePreset = {
  id: MobileDeviceId;
  label: string;
  platform: "ios" | "android";
  bezel: string;
  bezelLayer: "above-screen" | "below-screen";
  geometry: MobileDeviceGeometry;
  camera?: {
    size: number;
    top: number;
  };
};

export const mobileDevices: Record<MobileDeviceId, MobileDevicePreset> = {
  iphone: {
    id: "iphone",
    label: "iPhone",
    platform: "ios",
    bezel: mobileAssets.iphoneBezel,
    bezelLayer: "above-screen",
    geometry: iphoneGeometry,
  },
  "pixel-10": {
    id: "pixel-10",
    label: "Pixel 10",
    platform: "android",
    bezel: mobileAssets.pixel10Bezel,
    bezelLayer: "below-screen",
    geometry: pixelGeometry,
    camera: {
      size: 32,
      top: 23,
    },
  },
};

type MobileDeviceContextValue = {
  device: MobileDevicePreset;
  nativePhone: boolean;
  viewportOffset: { top: number; left: number };
  deviceId: MobileDeviceId;
  setDeviceId: (deviceId: MobileDeviceId) => void;
};

const MobileDeviceContext = createContext<MobileDeviceContextValue | null>(null);

export function MobileDeviceProvider({ children }: PropsWithChildren) {
  const [deviceId, setDeviceId] = useState<MobileDeviceId>("iphone");
  const viewport = useNativePhoneViewport();
  const value = useMemo(() => {
    const preset = mobileDevices[deviceId];
    const device = viewport.native ? { ...preset, camera: undefined, geometry: {
      device: { width: viewport.width, height: viewport.height },
      screen: { x: 0, y: 0, width: viewport.width, height: viewport.height, radius: 0 },
      // A compact strip keeps the prototype scenario control clear of app headers.
      safeArea: { top: Math.max(32, viewport.safeTop + 30), bottom: viewport.safeBottom },
      keyboard: { height: 0 },
    } } : preset;
    return { device, deviceId, setDeviceId, nativePhone: viewport.native,
      viewportOffset: { top: viewport.top, left: viewport.left } };
  }, [deviceId, viewport.native, viewport.width, viewport.height, viewport.top, viewport.left, viewport.safeTop, viewport.safeBottom]);

  return <MobileDeviceContext.Provider value={value}>{children}</MobileDeviceContext.Provider>;
}

export function useMobileDevice() {
  const context = useContext(MobileDeviceContext);

  if (!context) {
    throw new Error("useMobileDevice must be used inside MobileDeviceProvider");
  }

  return context;
}

export function DevicePicker() {
  const { device, deviceId, setDeviceId } = useMobileDevice();

  return (
    <DropdownMenu.Root>
      <div className="device-menu-bar" data-testid="device-menu-bar">
        <DropdownMenu.Trigger asChild>
          <button
            className="device-picker-trigger"
            data-testid="device-picker"
            aria-label={`Preview device: ${device.label}`}
            type="button"
          >
            <span>{device.label}</span>
            <ChevronDownIcon aria-hidden="true" />
          </button>
        </DropdownMenu.Trigger>
      </div>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="device-picker-menu" align="end" sideOffset={8} collisionPadding={12}>
          <DropdownMenu.RadioGroup
            value={deviceId}
            onValueChange={(value) => setDeviceId(value as MobileDeviceId)}
          >
            {Object.values(mobileDevices).map((option) => (
              <DropdownMenu.RadioItem
                key={option.id}
                className="device-picker-item"
                value={option.id}
                data-testid={`device-option-${option.id}`}
              >
                <span>{option.label}</span>
                <DropdownMenu.ItemIndicator className="device-picker-check">
                  <CheckIcon aria-hidden="true" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
