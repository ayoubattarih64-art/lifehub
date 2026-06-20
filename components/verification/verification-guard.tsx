"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LockIcon } from "@/components/icons";
import { useVerification } from "@/lib/verification";

interface VerificationGuardProps {
  children: React.ReactNode;
  /**
   * Where the "Verify now" call-to-action links to.
   * Defaults to the verification page.
   */
  verifyHref?: string;
  /** Optional custom fallback shown when the user is not verified. */
  fallback?: React.ReactNode;
  /** Optional title/description overrides for the default locked state. */
  title?: string;
  description?: string;
}

/**
 * VerificationGuard — a reusable client wrapper that gates content behind
 * email verification. Unverified users see a friendly locked state with a
 * call-to-action instead of the protected content.
 *
 * Usage:
 *   <VerificationGuard>
 *     <SensitiveThing />
 *   </VerificationGuard>
 */
export function VerificationGuard({
  children,
  verifyHref = "/verification",
  fallback,
  title = "Verification required",
  description = "Verify your email address to unlock this section.",
}: VerificationGuardProps) {
  const { isVerified, hydrated } = useVerification();

  // While reading storage, render nothing structural to avoid a flash of the
  // locked state for users who are actually verified.
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center py-14 text-sm text-muted-foreground">
        Checking verification…
      </div>
    );
  }

  if (isVerified) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <EmptyState
      icon={LockIcon}
      title={title}
      description={description}
      action={
        <Button href={verifyHref}>
          Verify now
        </Button>
      }
    />
  );
}

/**
 * Convenience inline link for prompting verification from anywhere.
 */
export function VerifyLink({
  href = "/verification",
  children = "Verify your email",
}: {
  href?: string;
  children?: React.ReactNode;
}) {
  return (
    <Link href={href} className="font-medium text-primary hover:underline">
      {children}
    </Link>
  );
}
