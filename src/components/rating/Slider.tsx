"use client";

import { cn } from "@/lib/utils";
import * as RadixSlider from "@radix-ui/react-slider";

interface SliderProps {
  value: number;
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  disabled?: boolean;
}

export function Slider({ value, onValueChange, min = 1, max = 10, step = 1, label, disabled }: SliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <label className="font-medium">{label}</label>
        <span className="font-mono text-primary">{value}</span>
      </div>
      <RadixSlider.Root
        dir="ltr"
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={onValueChange}
        disabled={disabled}
        className={cn(
          "relative h-2 w-full grow overflow-visible rounded-full bg-secondary",
          "[&_[data-orientation=horizontal]]:h-2",
          "[&_[data-orientation=vertical]]:w-2"
        )}
      >
        <RadixSlider.Track className="relative h-full grow">
          <RadixSlider.Range className="absolute h-full bg-primary" />
        </RadixSlider.Track>
        <RadixSlider.Thumb
          className={cn(
            "block h-5 w-5 rounded-full bg-background border-2 border-primary",
            "shadow-lg transition-all duration-100",
            "hover:border-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        />
      </RadixSlider.Root>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}