"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocalStorage } from "@/lib/storage";
import { uid, formatDate } from "@/lib/utils";
import type { MemoryBook, MemoryBookTemplate } from "@/lib/types";
import { MEMORY_TEMPLATES, getTemplate } from "@/lib/memory-templates";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Field, Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  BookOpenIcon,
  PlusIcon,
  TrashIcon,
  ArrowRightIcon,
} from "@/components/icons";

export default function MemoryBooksPage() {
  const [books, setBooks] = useLocalStorage<MemoryBook[]>("memory-books", []);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [template, setTemplate] = useState<MemoryBookTemplate>("wedding");

  function createBook() {
    if (!title.trim()) return;
    const now = new Date().toISOString();
    const book: MemoryBook = {
      id: uid("book"),
      title: title.trim(),
      subtitle: subtitle.trim(),
      template,
      pages: [],
      createdAt: now,
      updatedAt: now,
    };
    setBooks((prev) => [book, ...prev]);
    setOpen(false);
    setTitle("");
    setSubtitle("");
    setTemplate("wedding");
  }

  function remove(id: string) {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Memory Books"
        description="Create beautiful PDF books from your memories using elegant templates."
        actions={
          <Button onClick={() => setOpen(true)}>
            <PlusIcon className="h-4 w-4" />
            New Book
          </Button>
        }
      />

      {books.length === 0 ? (
        <EmptyState
          icon={BookOpenIcon}
          title="No memory books yet"
          description="Start by creating your first book and choose a template that fits the occasion."
          action={
            <Button onClick={() => setOpen(true)}>
              <PlusIcon className="h-4 w-4" />
              Create your first book
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => {
            const t = getTemplate(book.template);
            return (
              <Card key={book.id} className="group overflow-hidden">
                <div
                  className={`flex h-32 items-center justify-center bg-gradient-to-br ${t.gradient} text-5xl`}
                >
                  {book.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.coverImage}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{t.emoji}</span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">{book.title}</h3>
                      {book.subtitle ? (
                        <p className="truncate text-sm text-muted-foreground">
                          {book.subtitle}
                        </p>
                      ) : null}
                    </div>
                    <button
                      onClick={() => remove(book.id)}
                      className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-500"
                      aria-label="Delete book"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant="primary">{t.name}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {book.pages.length} page
                      {book.pages.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Updated {formatDate(book.updatedAt)}
                  </p>
                  <Link
                    href={`/memory-books/${book.id}`}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary"
                  >
                    Open editor
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create a memory book"
        description="Give it a title and pick a template to get started."
      >
        <div className="space-y-4">
          <Field label="Title">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Our Wedding Day"
              autoFocus
            />
          </Field>
          <Field label="Subtitle (optional)">
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="June 2025 · Marrakech"
            />
          </Field>
          <div>
            <p className="mb-1.5 text-sm font-medium">Template</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {MEMORY_TEMPLATES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTemplate(t.key)}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition ${
                    template === t.key
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-surface-muted"
                  }`}
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <span className="text-xs font-medium">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createBook} disabled={!title.trim()}>
              Create book
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
