"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { type RefObject } from "react";

type TurnstileWidgetProps = {
  siteKey: string;
  instanceRef: RefObject<TurnstileInstance | null>;
  onToken: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
};

export function TurnstileWidget({
  siteKey,
  instanceRef,
  onToken,
  onError,
  onExpire,
}: TurnstileWidgetProps) {
  return (
    <Turnstile
      ref={instanceRef}
      siteKey={siteKey}
      options={{ size: "invisible", execution: "execute", theme: "light" }}
      onSuccess={onToken}
      onError={onError}
      onExpire={onExpire}
    />
  );
}
