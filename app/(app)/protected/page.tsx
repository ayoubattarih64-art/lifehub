"use client";

import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VerificationBadge } from "@/components/verification/verification-badge";
import {
  VerificationGuard,
  VerifyLink,
} from "@/components/verification/verification-guard";
import { ShieldCheckIcon, LockIcon } from "@/components/icons";
import { useVerification } from "@/lib/verification";

/**
 * Protected Routes demo.
 *
 * Demonstrates how the reusable VerificationGuard gates content behind email
 * verification. Unverified visitors see a locked state with a call-to-action;
 * verified visitors see the protected content.
 */
export default function ProtectedDemoPage() {
  const { state, isVerified, hydrated } = useVerification();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Protected area"
        description="This page is gated behind email verification using the reusable VerificationGuard."
        actions={hydrated ? <VerificationBadge status={state.status} /> : null}
      />

      <Card>
        <CardHeader className="flex flex-row items-start gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl text-primary">
            <LockIcon />
          </span>
          <div>
            <CardTitle>How this works</CardTitle>
            <CardDescription className="mt-1">
              The content below is wrapped in <code>VerificationGuard</code>. If
              your email isn&apos;t verified yet, you&apos;ll see a locked
              prompt instead. <VerifyLink />.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <VerificationGuard
        title="This area is locked"
        description="Verify your email address to view the protected content on this page."
      >
        <Card>
          <CardHeader className="flex flex-row items-start gap-3">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-xl text-emerald-500">
              <ShieldCheckIcon />
            </span>
            <div>
              <CardTitle>Welcome, verified member</CardTitle>
              <CardDescription className="mt-1">
                You can see this because your email
                {state.email ? ` (${state.email})` : ""} is verified.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              In a real application this is where sensitive, members-only
              content would live — account settings, private archives, billing,
              and more. The same <code>VerificationGuard</code> wrapper can be
              reused to protect any route or section.
            </p>
          </CardContent>
        </Card>
      </VerificationGuard>

      {isVerified ? (
        <p className="text-center text-sm text-muted-foreground">
          Tip: you can revoke verification from the{" "}
          <VerifyLink>verification page</VerifyLink> to preview the locked
          state again.
        </p>
      ) : null}
    </div>
  );
}
