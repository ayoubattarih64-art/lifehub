"use client";

import { useState } from "react";
import { useLocalStorage } from "@/lib/storage";
import { uid } from "@/lib/utils";
import type { FamilyArchive, FamilyMember, FamilyStory } from "@/lib/types";
import { generatePdf } from "@/lib/pdf";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import {
  PhotoUploader,
  SingleImageUploader,
} from "@/components/photo-uploader";
import { FamilyIcon, PlusIcon, TrashIcon, DownloadIcon } from "@/components/icons";

const EMPTY: FamilyArchive = { members: [], stories: [] };

export default function FamilyArchivePage() {
  const [data, setData] = useLocalStorage<FamilyArchive>(
    "family-archive",
    EMPTY
  );
  const [memberOpen, setMemberOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);

  // member form
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();

  // story form
  const [sTitle, setSTitle] = useState("");
  const [sYear, setSYear] = useState("");
  const [sContent, setSContent] = useState("");
  const [sImages, setSImages] = useState<string[]>([]);

  function addMember() {
    if (!name.trim()) return;
    const member: FamilyMember = {
      id: uid("member"),
      name: name.trim(),
      relation: relation.trim(),
      birthYear: birthYear.trim() || undefined,
      note: note.trim() || undefined,
      photo,
    };
    setData((d) => ({ ...d, members: [...d.members, member] }));
    setMemberOpen(false);
    setName("");
    setRelation("");
    setBirthYear("");
    setNote("");
    setPhoto(undefined);
  }

  function addStory() {
    if (!sTitle.trim()) return;
    const story: FamilyStory = {
      id: uid("story"),
      title: sTitle.trim(),
      year: sYear.trim() || undefined,
      content: sContent.trim(),
      images: sImages,
    };
    setData((d) => ({ ...d, stories: [...d.stories, story] }));
    setStoryOpen(false);
    setSTitle("");
    setSYear("");
    setSContent("");
    setSImages([]);
  }

  function removeMember(id: string) {
    setData((d) => ({ ...d, members: d.members.filter((m) => m.id !== id) }));
  }

  function removeStory(id: string) {
    setData((d) => ({ ...d, stories: d.stories.filter((s) => s.id !== id) }));
  }

  function exportBook() {
    generatePdf({
      title: "Our Family Story",
      subtitle: `${data.members.length} members · ${data.stories.length} stories`,
      accent: "#e11d48",
      footer: "Created with LifeHub",
      sections: [
        {
          heading: "Family Members",
          body: data.members
            .map(
              (m) =>
                `${m.name}${m.relation ? ` — ${m.relation}` : ""}${
                  m.birthYear ? ` (b. ${m.birthYear})` : ""
                }${m.note ? `\n${m.note}` : ""}`
            )
            .join("\n\n"),
        },
        ...data.stories.map((s) => ({
          heading: s.title,
          meta: s.year,
          body: s.content,
          images: s.images,
        })),
      ],
    });
  }

  const empty = data.members.length === 0 && data.stories.length === 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Family Archive"
        description="Preserve your family history, photos and stories — then generate a family memory book."
        actions={
          <Button onClick={exportBook} disabled={empty}>
            <DownloadIcon className="h-4 w-4" />
            Family Book
          </Button>
        }
      />

      {/* Members */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Family members{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({data.members.length})
            </span>
          </h2>
          <Button variant="outline" size="sm" onClick={() => setMemberOpen(true)}>
            <PlusIcon className="h-4 w-4" />
            Add member
          </Button>
        </div>

        {data.members.length === 0 ? (
          <EmptyState
            icon={FamilyIcon}
            title="No family members yet"
            description="Add relatives to build your family tree."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.members.map((m) => (
              <Card key={m.id}>
                <CardContent className="flex items-start gap-3 pt-6">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-muted text-lg font-semibold text-muted-foreground">
                    {m.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.photo}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      m.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{m.name}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {m.relation}
                          {m.birthYear ? ` · b. ${m.birthYear}` : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => removeMember(m.id)}
                        className="rounded-lg p-1 text-muted-foreground transition hover:text-red-500"
                        aria-label="Remove member"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    {m.note ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {m.note}
                      </p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Stories */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Family stories{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({data.stories.length})
            </span>
          </h2>
          <Button variant="outline" size="sm" onClick={() => setStoryOpen(true)}>
            <PlusIcon className="h-4 w-4" />
            Add story
          </Button>
        </div>

        {data.stories.length === 0 ? (
          <EmptyState
            title="No stories yet"
            description="Capture memorable family stories and milestones."
          />
        ) : (
          <div className="space-y-4">
            {data.stories.map((s) => (
              <Card key={s.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{s.title}</h3>
                      {s.year ? (
                        <p className="text-sm text-muted-foreground">{s.year}</p>
                      ) : null}
                    </div>
                    <button
                      onClick={() => removeStory(s.id)}
                      className="rounded-lg p-1 text-muted-foreground transition hover:text-red-500"
                      aria-label="Remove story"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  {s.content ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                      {s.content}
                    </p>
                  ) : null}
                  {s.images.length ? (
                    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {s.images.map((src, i) => (
                        <div
                          key={i}
                          className="aspect-square overflow-hidden rounded-lg border border-border"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Add member modal */}
      <Modal
        open={memberOpen}
        onClose={() => setMemberOpen(false)}
        title="Add family member"
      >
        <div className="space-y-4">
          <SingleImageUploader
            image={photo}
            onChange={setPhoto}
            label="Add photo"
            rounded="full"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Relation">
              <Input
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                placeholder="Grandfather"
              />
            </Field>
          </div>
          <Field label="Birth year (optional)">
            <Input
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              placeholder="1945"
            />
          </Field>
          <Field label="Note (optional)">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setMemberOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addMember} disabled={!name.trim()}>
              Add member
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add story modal */}
      <Modal
        open={storyOpen}
        onClose={() => setStoryOpen(false)}
        title="Add family story"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <Input value={sTitle} onChange={(e) => setSTitle(e.target.value)} />
            </Field>
            <Field label="Year (optional)">
              <Input value={sYear} onChange={(e) => setSYear(e.target.value)} />
            </Field>
          </div>
          <Field label="Story">
            <Textarea
              value={sContent}
              onChange={(e) => setSContent(e.target.value)}
            />
          </Field>
          <div>
            <p className="mb-1.5 text-sm font-medium">Photos</p>
            <PhotoUploader images={sImages} onChange={setSImages} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setStoryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addStory} disabled={!sTitle.trim()}>
              Add story
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
