"use client";

import { cn } from "@/lib/utils";
import { getPinColor } from "@/lib/map/utils";

interface DenominationPinProps {
  denomination: string | null;
  selected?: boolean;
  size?: number;
}

export function DenominationPin({ denomination, selected = false, size = 28 }: DenominationPinProps) {
  const color = getPinColor(denomination);
  const pinSize = selected ? size + 4 : size;

  return (
    <div
      className={cn(
        "flex items-center justify-center cursor-pointer transition-transform duration-100",
        selected && "scale-110"
      )}
      style={{ width: pinSize, height: pinSize }}
    >
      <svg
        width={pinSize}
        height={pinSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2C8.13401 2 5 5.13401 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13401 15.866 2 12 2Z"
          fill={color}
          stroke="#fff"
          strokeWidth={selected ? 3 : 2}
        />
        <circle cx={12} cy={9} r={3.5} fill="#fff" opacity={0.2} />
      </svg>
    </div>
  );
}