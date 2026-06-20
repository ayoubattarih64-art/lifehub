import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStatusMeta } from "@/lib/verification";
import type { VerificationStatus } from "@/lib/types";
import {
  CheckIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
} from "@/components/icons";

interface VerificationBadgeProps {
  status: VerificationStatus;
  /** Hide the leading icon (defaults to shown). */
  showIcon?: boolean;
  className?: string;
}

const ICONS = {
  verified: ShieldCheckIcon,
  pending: ShieldAlertIcon,
  unverified: ShieldAlertIcon,
} as const;

/**
 * VerificationBadge — a reusable status pill built on the existing Badge.
 * Reflects "verified" / "pending" / "unverified" using design-system variants.
 */
export function VerificationBadge({
  status,
  showIcon = true,
  className,
}: VerificationBadgeProps) {
  const meta = getStatusMeta(status);
  const Icon = status === "verified" ? CheckIcon : ICONS[status];

  return (
    <Badge variant={meta.badgeVariant} className={cn("gap-1", className)}>
      {showIcon ? <Icon className="h-3.5 w-3.5" /> : null}
      {meta.label}
    </Badge>
  );
}
