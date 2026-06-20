import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import {
  MailIcon,
  ShieldCheckIcon,
  LockIcon,
} from "@/components/icons";
import { EmailVerificationCard } from "@/components/verification/email-verification-card";

export const metadata = {
  title: "Email verification — LifeHub",
  description: "Verify your email address to unlock protected sections.",
};

const BENEFITS = [
  {
    icon: ShieldCheckIcon,
    title: "Trusted account",
    description:
      "A verified email confirms your identity and keeps your archive secure.",
  },
  {
    icon: LockIcon,
    title: "Unlock protected areas",
    description:
      "Some sections require verification before they can be opened.",
  },
  {
    icon: MailIcon,
    title: "Account recovery",
    description:
      "Stay reachable for important updates about your memories and data.",
  },
] as const;

export default function VerificationPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Email verification"
        description="Confirm your email address to unlock protected sections of LifeHub."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Verification flow */}
        <div className="lg:col-span-3">
          <EmailVerificationCard />
        </div>

        {/* Why verify */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="space-y-5 pt-5 sm:pt-6">
              <h3 className="text-base font-semibold">Why verify?</h3>
              <ul className="space-y-4">
                {BENEFITS.map((b) => {
                  const Icon = b.icon;
                  return (
                    <li key={b.title} className="flex items-start gap-3">
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-medium">{b.title}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {b.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
