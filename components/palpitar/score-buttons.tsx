"use client";

import { useState } from "react";

type ScoreButtonsProps = {
  value: number | null;
  onChange: (next: number) => void;
  disabled?: boolean;
};

const BASE = [0, 1, 2, 3, 4, 5, 6] as const;
const HIGH = [8, 9, 10, 11, 12, 13, 14] as const;

export function ScoreButtons({
  value,
  onChange,
  disabled = false,
}: ScoreButtonsProps) {
  const valueIsHigh = value != null && value >= 7;
  const [showHigh, setShowHigh] = useState(valueIsHigh);
  const expanded = showHigh || valueIsHigh;

  function handleSevenPlus() {
    if (disabled) return;
    setShowHigh(true);
    if (value == null || value < 7) onChange(7);
  }

  function handleBase(n: number) {
    if (disabled) return;
    setShowHigh(false);
    onChange(n);
  }

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-4 gap-1.5">
        {BASE.map((n) => (
          <Button
            key={n}
            label={String(n)}
            active={value === n}
            onClick={() => handleBase(n)}
            disabled={disabled}
          />
        ))}
        <Button
          label="7+"
          active={expanded && value != null && value >= 7}
          onClick={handleSevenPlus}
          disabled={disabled}
        />
      </div>
      {expanded && (
        <div className="grid grid-cols-4 gap-1.5">
          {HIGH.map((n) => (
            <Button
              key={n}
              label={String(n)}
              active={value === n}
              onClick={() => !disabled && onChange(n)}
              disabled={disabled}
            />
          ))}
          <Button
            label="15+"
            active={value === 15}
            onClick={() => !disabled && onChange(15)}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}

function Button({
  label,
  active,
  onClick,
  disabled,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-11 items-center justify-center rounded-md text-sm font-semibold transition-colors ${
        disabled
          ? "cursor-not-allowed bg-slate-100 text-slate-400"
          : active
            ? "bg-brand-blue text-white"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}
