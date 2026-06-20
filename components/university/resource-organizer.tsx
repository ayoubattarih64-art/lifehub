"use client";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderIcon } from "@/components/icons";
import { ResourceCard } from "@/components/university/resource-card";
import { groupResourcesByType, sortResourcesByNewest } from "@/lib/university";
import { cn } from "@/lib/utils";
import type { UniResource } from "@/lib/types";

export interface ResourceOrganizerProps {
  /** Resources to organize — typically those scoped to a single subject. */
  resources: UniResource[];
  /** Forwarded to each ResourceCard. Omit to render cards read-only. */
  onRemove?: (id: string) => void;
  /** Title shown above the empty state when there are no resources. */
  emptyTitle?: string;
  /** Description shown in the empty state. */
  emptyDescription?: string;
  /** Action node rendered inside the empty state (e.g. an upload button). */
  emptyAction?: React.ReactNode;
  className?: string;
}

/**
 * ResourceOrganizer — groups resources by type and lays them out as sections.
 *
 * Uses the data-layer helpers `groupResourcesByType` (which preserves the
 * canonical Course → TD → TP → Exam → Other ordering and drops empty groups)
 * and `sortResourcesByNewest` so each section lists its most recent uploads
 * first. Every resource is rendered with the shared ResourceCard, and a
 * design-system EmptyState is shown when there is nothing to organize.
 *
 * Search and filtering are intentionally out of scope here — this component
 * only handles structural organization of an already-scoped resource list.
 */
export function ResourceOrganizer({
  resources,
  onRemove,
  emptyTitle = "No resources yet",
  emptyDescription = "Uploaded courses, tutorials and exams will be organized here by type.",
  emptyAction,
  className,
}: ResourceOrganizerProps) {
  const groups = groupResourcesByType(resources);

  if (groups.length === 0) {
    return (
      <EmptyState
        icon={FolderIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        className={className}
      />
    );
  }

  return (
    <div className={cn("space-y-8", className)}>
      {groups.map(({ meta, resources: groupResources }) => {
        const sorted = sortResourcesByNewest(groupResources);
        return (
          <section key={meta.type} aria-label={meta.label}>
            <div className="mb-3 flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight">
                {meta.label}
              </h3>
              <Badge variant={meta.badgeVariant}>{sorted.length}</Badge>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {sorted.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
