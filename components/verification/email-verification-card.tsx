"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import {
  CheckIcon,
  MailIcon,
  ShieldCheckIcon,
} from "@/components/icons";
import { VerificationBadge } from "@/components/verification/verification-badge";
import { CodeInput } from "@/components/verification/code-input";
import {
  CODE_LENGTH,
  isValidEmail,
  useVerification,
} from "@/lib/verification";

type Step = "email" | "code";

interface EmailVerificationCardProps {
  /** Optional callback fired when verification completes. */
  onVerified?: () => void;
  className?: string;
}

/**
 * EmailVerificationCard — the complete, reusable email verification UI.
 *
 * Flow: enter email → "send" a 6-digit code → enter code → verified.
 * Uses the local-first useVerification hook. The generated code is surfaced
 * inline (simulating the email) since there is no backend mailer.
 */
export function EmailVerificationCard({
  onVerified,
  className,
}: EmailVerificationCardProps) {
  const { state, hydrated, isVerified, canResend, sendCode, markVerified, reset } =
    useVerification();

  const [step, setStep] = useState<Step>("email");
  const [emailInput, setEmailInput] = useState(state.email);
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const emailValid = isValidEmail(emailInput);

  function handleSend() {
    setError(null);
    if (!emailValid) {
      setError("Enter a valid email address.");
      return;
    }
    const issued = sendCode(emailInput);
    setSentCode(issued);
    setCode("");
    setStep("code");
  }

  function handleResend() {
    if (!canResend) return;
    const issued = sendCode(emailInput);
    setSentCode(issued);
    setCode("");
    setError(null);
  }

  function handleVerify() {
    setError(null);
    if (code.length !== CODE_LENGTH) {
      setError("Enter the full 6-digit code.");
      return;
    }
    if (sentCode && code === sentCode) {
      markVerified();
      onVerified?.();
    } else {
      setError("That code doesn't match. Please try again.");
    }
  }

  function handleReset() {
    reset();
    setStep("email");
    setEmailInput("");
    setCode("");
    setSentCode(null);
    setError(null);
  }

  // Avoid hydration flash: render a stable shell until storage is read.
  if (!hydrated) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Email verification</CardTitle>
          <CardDescription>Loading…</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // ---- Verified state ----
  if (isVerified) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-xl text-emerald-500">
              <ShieldCheckIcon />
            </span>
            <div>
              <CardTitle>Email verified</CardTitle>
              <CardDescription className="mt-1">
                {state.email} is verified. You now have full access.
              </CardDescription>
            </div>
          </div>
          <VerificationBadge status="verified" />
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset verification
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl text-primary">
            <MailIcon />
          </span>
          <div>
            <CardTitle>Verify your email</CardTitle>
            <CardDescription className="mt-1">
              {step === "email"
                ? "We'll send a 6-digit code to confirm your address."
                : `Enter the code we sent to ${state.email}.`}
            </CardDescription>
          </div>
        </div>
        <VerificationBadge status={state.status} />
      </CardHeader>

      <CardContent className="space-y-4">
        {step === "email" ? (
          <>
            <Field label="Email address" htmlFor="verify-email">
              <Input
                id="verify-email"
                type="email"
                placeholder="you@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
              />
            </Field>
            {error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : null}
            <Button onClick={handleSend} disabled={!emailValid}>
              <MailIcon className="h-4 w-4" />
              Send verification code
            </Button>
          </>
        ) : (
          <>
            <div>
              <p className="mb-2 text-sm font-medium">Verification code</p>
              <CodeInput
                length={CODE_LENGTH}
                value={code}
                onChange={setCode}
                invalid={!!error}
              />
            </div>

            {sentCode ? (
              <p className="rounded-xl border border-dashed border-border bg-surface-muted px-3 py-2 text-xs text-muted-foreground">
                Demo mode — your code is{" "}
                <span className="font-semibold text-foreground">{sentCode}</span>
                . In production this would be emailed instead.
              </p>
            ) : null}

            {error ? <p className="text-sm text-red-500">{error}</p> : null}

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={handleVerify} disabled={code.length !== CODE_LENGTH}>
                <CheckIcon className="h-4 w-4" />
                Verify
              </Button>
              <Button
                variant="ghost"
                onClick={handleResend}
                disabled={!canResend}
              >
                {canResend ? "Resend code" : "Resend available shortly"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setStep("email");
                  setError(null);
                }}
              >
                Change email
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
