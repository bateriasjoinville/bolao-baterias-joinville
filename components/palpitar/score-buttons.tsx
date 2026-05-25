"use client";

import { useState } from "react";

type ScoreButtonsProps = {
  value: number | null;
  onChange: (next: number) => void;
  disabled?: boolean;
};

const BASE = [0, 1, 2, 3, 4] as const;
const EXTENDED = [5, 6, 7, 8, 9, 10] as const;

export function ScoreButtons({
  value,
  onChange,
  disabled = false,
}: ScoreButtonsProps) {
  const valueIsHigh = value != null && value >= 5;
  const [showExtended, setShowExtended] = useState(valueIsHigh);

  const expanded = showExtended || valueIsHigh;

  function handleFive() {
    if (disabled) return;
    setShowExtended(true);
    if (value == null || value < 5) onChange(5);
  }

  function handleBase(n: number) {
    if (disabled) return;
    setShowExtended(false);
    onChange(n);
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1.5">
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
          label="5+"
          active={expanded && value != null && value >= 5}
          onClick={handleFive}
          disabled={disabled}
        />
      </div>
      {expanded && (
        <div className="flex gap-1.5">
          {EXTENDED.map((n) => (
            <Button
              key={n}
              label={String(n)}
              active={value === n}
              onClick={() => !disabled && onChange(n)}
              disabled={disabled}
            />
          ))}
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
      className={`flex min-h-11 flex-1 items-center justify-center rounded-md text-sm font-semibold transition-colors ${
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
