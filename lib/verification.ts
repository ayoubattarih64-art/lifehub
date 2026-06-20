"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "@/lib/storage";
import type { VerificationState, VerificationStatus } from "@/lib/types";

/**
 * Verification System helpers.
 *
 * This is a front-end, local-first verification flow that mirrors a real
 * email verification UX without a backend: a 6-digit code is generated and
 * "sent" (kept in memory of the flow), then validated by the user.
 *
 * All persisted state lives under the namespaced localStorage key below so it
 * never collides with the existing modules.
 */

export const VERIFICATION_STORAGE_KEY = "verification";

/** Number of digits in a verification code. */
export const CODE_LENGTH = 6;

/** How long (ms) a code remains valid after it is issued. */
export const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/** Minimum delay (ms) before a code can be resent. */
export const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds

export const DEFAULT_VERIFICATION_STATE: VerificationState = {
  email: "",
  status: "unverified",
  attempts: 0,
};

/** Basic RFC-5322-ish email check, kept intentionally simple. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Generate a zero-padded numeric code of CODE_LENGTH digits. */
export function generateCode(length = CODE_LENGTH): string {
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

export interface VerificationStatusMeta {
  status: VerificationStatus;
  label: string;
  /** Maps onto the existing Badge component variants. */
  badgeVariant: "success" | "warning" | "default";
}

export const VERIFICATION_STATUS_META: Record<
  VerificationStatus,
  VerificationStatusMeta
> = {
  verified: {
    status: "verified",
    label: "Verified",
    badgeVariant: "success",
  },
  pending: {
    status: "pending",
    label: "Pending",
    badgeVariant: "warning",
  },
  unverified: {
    status: "unverified",
    label: "Unverified",
    badgeVariant: "default",
  },
};

export function getStatusMeta(status: VerificationStatus): VerificationStatusMeta {
  return VERIFICATION_STATUS_META[status] ?? VERIFICATION_STATUS_META.unverified;
}

/**
 * useVerification — central hook for the verification flow.
 *
 * The persisted state only tracks status/email/timestamps; the active code is
 * deliberately NOT persisted (it lives only for the lifetime of the flow via
 * the returned helpers), which keeps the model simple and avoids leaking the
 * code into storage.
 */
export function useVerification() {
  const [state, setState, hydrated] = useLocalStorage<VerificationState>(
    VERIFICATION_STORAGE_KEY,
    DEFAULT_VERIFICATION_STATE
  );

  const isVerified = state.status === "verified";

  const setEmail = useCallback(
    (email: string) => {
      setState((prev) => ({ ...prev, email }));
    },
    [setState]
  );

  /**
   * Begin (or restart) the verification flow for the current email.
   * Returns the generated code so the caller can surface it in a dev-friendly
   * way (e.g. a toast simulating the email). In a real backend this would be
   * emailed and never returned to the client.
   */
  const sendCode = useCallback(
    (email?: string): string => {
      const target = (email ?? state.email).trim();
      const code = generateCode();
      setState((prev) => ({
        ...prev,
        email: target,
        status: "pending",
        lastSentAt: new Date().toISOString(),
        attempts: prev.attempts + 1,
      }));
      return code;
    },
    [setState, state.email]
  );

  /** Mark verification as complete. */
  const markVerified = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: "verified",
      verifiedAt: new Date().toISOString(),
    }));
  }, [setState]);

  /** Reset everything back to the unverified default. */
  const reset = useCallback(() => {
    setState(DEFAULT_VERIFICATION_STATE);
  }, [setState]);

  // Track "now" in state and refresh it on an interval so the resend
  // cooldown can be derived purely during render (without calling the
  // impure Date.now() in the render body).
  const [now, setNow] = useState(0);
  useEffect(() => {
    queueMicrotask(() => setNow(Date.now()));
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  /** Whether enough time has elapsed since the last send to resend. */
  const canResend = state.lastSentAt
    ? now === 0 ||
      now - new Date(state.lastSentAt).getTime() >= RESEND_COOLDOWN_MS
    : true;

  return {
    state,
    hydrated,
    isVerified,
    canResend,
    setEmail,
    sendCode,
    markVerified,
    reset,
  } as const;
}
