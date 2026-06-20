"use client";

import { useState } from "react";
import { useLocalStorage } from "@/lib/storage";
import { uid, formatDate } from "@/lib/utils";
import type { TravelJournal, TravelEntry } from "@/lib/types";
import { generatePdf } from "@/lib/pdf";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  PhotoUploader,
  SingleImageUploader,
} from "@/components/photo-uploader";
import {
  PlaneIcon,
  PlusIcon,
  TrashIcon,
  DownloadIcon,
  ChevronLeftIcon,
} from "@/components/icons";

export default function TravelJournalsPage() {
  const [journals, setJournals] = useLocalStorage<TravelJournal[]>(
    "travel-journals",
    []
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // create form
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const selected = journals.find((j) => j.id === selectedId) ?? null;

  function createJournal() {
    if (!title.trim()) return;
    const journal: TravelJournal = {
      id: uid("trip"),
      title: title.trim(),
      destination: destination.trim(),
      startDate,
      endDate,
      entries: [],
      createdAt: new Date().toISOString(),
    };
    setJournals((prev) => [journal, ...prev]);
    setCreateOpen(false);
    setTitle("");
    setDestination("");
    setStartDate("");
    setEndDate("");
    setSelectedId(journal.id);
  }

  function updateJournal(id: string, mut: (j: TravelJournal) => TravelJournal) {
    setJournals((prev) => prev.map((j) => (j.id === id ? mut(j) : j)));
  }

  function removeJournal(id: string) {
    setJournals((prev) => prev.filter((j) => j.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function addEntry(id: string) {
    const entry: TravelEntry = {
      id: uid("entry"),
      day: "",
      location: "",
      notes: "",
      images: [],
    };
    updateJournal(id, (j) => ({ ...j, entries: [...j.entries, entry] }));
  }

  function updateEntry(
    journalId: string,
    entryId: string,
    patch: Partial<TravelEntry>
  ) {
    updateJournal(journalId, (j) => ({
      ...j,
      entries: j.entries.map((e) =>
        e.id === entryId ? { ...e, ...patch } : e
      ),
    }));
  }

  function removeEntry(journalId: string, entryId: string) {
    updateJournal(journalId, (j) => ({
      ...j,
      entries: j.entries.filter((e) => e.id !== entryId),
    }));
  }

  function exportPdf(journal: TravelJournal) {
    generatePdf({
      title: journal.title,
      subtitle: journal.destination,
      accent: "#0891b2",
      cover: journal.coverImage,
      footer: "Travel journal · Created with LifeHub",
      sections: journal.entries.map((e) => ({
        heading: e.location || "Untitled stop",
        meta: e.day,
        body: e.notes,
        images: e.images,
      })),
    });
  }

  /* -------- Detail view -------- */
  if (selected) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedId(null)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          All journals
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {selected.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {selected.destination}
            </p>
          </div>
          <Button
            onClick={() => exportPdf(selected)}
            disabled={selected.entries.length === 0}
          >
            <DownloadIcon className="h-4 w-4" />
            Export magazine PDF
          </Button>
        </div>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <p className="text-sm font-medium">Cover image</p>
            <SingleImageUploader
              image={selected.coverImage}
              onChange={(img) =>
                updateJournal(selected.id, (j) => ({ ...j, coverImage: img }))
              }
              label="Upload cover"
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Journal entries{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({selected.entries.length})
            </span>
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addEntry(selected.id)}
          >
            <PlusIcon className="h-4 w-4" />
            Add entry
          </Button>
        </div>

        {selected.entries.length === 0 ? (
          <EmptyState
            title="No entries yet"
            description="Add stops with dates, locations, notes and photos."
          />
        ) : (
          <div className="space-y-4">
            {selected.entries.map((e, idx) => (
              <Card key={e.id}>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between">
                    <Badge>Stop {idx + 1}</Badge>
                    <button
                      onClick={() => removeEntry(selected.id, e.id)}
                      className="rounded-lg p-1 text-muted-foreground transition hover:text-red-500"
                      aria-label="Remove entry"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Date">
                      <Input
                        type="date"
                        value={e.day}
                        onChange={(ev) =>
                          updateEntry(selected.id, e.id, {
                            day: ev.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label="Location">
                      <Input
                        value={e.location}
                        onChange={(ev) =>
                          updateEntry(selected.id, e.id, {
                            location: ev.target.value,
                          })
                        }
                        placeholder="Kyoto, Japan"
                      />
                    </Field>
                  </div>
                  <Field label="Notes">
                    <Textarea
                      value={e.notes}
                      onChange={(ev) =>
                        updateEntry(selected.id, e.id, {
                          notes: ev.target.value,
                        })
                      }
                    />
                  </Field>
                  <div>
                    <p className="mb-1.5 text-sm font-medium">Photos</p>
                    <PhotoUploader
                      images={e.images}
                      onChange={(images) =>
                        updateEntry(selected.id, e.id, { images })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* -------- List view -------- */
  return (
    <div className="space-y-8">
      <PageHeader
        title="Travel Journals"
        description="Document your trips with photos, locations and notes — then export a magazine-style PDF."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon className="h-4 w-4" />
            New Journal
          </Button>
        }
      />

      {journals.length === 0 ? (
        <EmptyState
          icon={PlaneIcon}
          title="No travel journals yet"
          description="Start documenting your next adventure."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon className="h-4 w-4" />
              Create a journal
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {journals.map((j) => (
            <Card key={j.id} className="group overflow-hidden">
              <div className="flex h-32 items-center justify-center bg-gradient-to-br from-sky-500 to-cyan-500 text-5xl">
                {j.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={j.coverImage}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>✈️</span>
                )}
              </div>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{j.title}</h3>
                    <p className="truncate text-sm text-muted-foreground">
                      {j.destination}
                    </p>
                  </div>
                  <button
                    onClick={() => removeJournal(j.id)}
                    className="rounded-lg p-1.5 text-muted-foreground transition hover:text-red-500"
                    aria-label="Delete journal"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {j.entries.length} stop{j.entries.length === 1 ? "" : "s"} ·{" "}
                  {formatDate(j.createdAt)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => setSelectedId(j.id)}
                >
                  Open journal
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New travel journal"
      >
        <div className="space-y-4">
          <Field label="Title">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summer in Japan"
              autoFocus
            />
          </Field>
          <Field label="Destination">
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Japan"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start date">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Field>
            <Field label="End date">
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createJournal} disabled={!title.trim()}>
              Create journal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
