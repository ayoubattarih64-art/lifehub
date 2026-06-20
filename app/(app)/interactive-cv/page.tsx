"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocalStorage } from "@/lib/storage";
import { uid, slugify } from "@/lib/utils";
import type {
  InteractiveCv,
  CvProject,
  CvEducation,
  CvSocialLink,
} from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SingleImageUploader } from "@/components/photo-uploader";
import { PlusIcon, TrashIcon, ExternalLinkIcon } from "@/components/icons";

export const DEFAULT_CV: InteractiveCv = {
  fullName: "",
  title: "",
  bio: "",
  location: "",
  email: "",
  slug: "",
  skills: [],
  projects: [],
  education: [],
  socials: [],
};

export default function InteractiveCvPage() {
  const [cv, setCv] = useLocalStorage<InteractiveCv>(
    "interactive-cv",
    DEFAULT_CV
  );
  const [skillInput, setSkillInput] = useState("");

  function patch(p: Partial<InteractiveCv>) {
    setCv((prev) => ({ ...prev, ...p }));
  }

  function addSkill() {
    const s = skillInput.trim();
    if (!s || cv.skills.includes(s)) return;
    patch({ skills: [...cv.skills, s] });
    setSkillInput("");
  }

  function removeSkill(s: string) {
    patch({ skills: cv.skills.filter((x) => x !== s) });
  }

  function addProject() {
    const project: CvProject = {
      id: uid("proj"),
      name: "",
      description: "",
    };
    patch({ projects: [...cv.projects, project] });
  }

  function updateProject(id: string, p: Partial<CvProject>) {
    patch({
      projects: cv.projects.map((x) => (x.id === id ? { ...x, ...p } : x)),
    });
  }

  function removeProject(id: string) {
    patch({ projects: cv.projects.filter((x) => x.id !== id) });
  }

  function addEducation() {
    const edu: CvEducation = { id: uid("edu"), school: "", degree: "", period: "" };
    patch({ education: [...cv.education, edu] });
  }

  function updateEducation(id: string, p: Partial<CvEducation>) {
    patch({
      education: cv.education.map((x) => (x.id === id ? { ...x, ...p } : x)),
    });
  }

  function removeEducation(id: string) {
    patch({ education: cv.education.filter((x) => x.id !== id) });
  }

  function addSocial() {
    const s: CvSocialLink = { id: uid("soc"), label: "", url: "" };
    patch({ socials: [...cv.socials, s] });
  }

  function updateSocial(id: string, p: Partial<CvSocialLink>) {
    patch({
      socials: cv.socials.map((x) => (x.id === id ? { ...x, ...p } : x)),
    });
  }

  function removeSocial(id: string) {
    patch({ socials: cv.socials.filter((x) => x.id !== id) });
  }

  const publicUrl = cv.slug ? `/cv/${cv.slug}` : null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Interactive CV"
        description="Build a professional portfolio page with a shareable public URL."
        actions={
          publicUrl ? (
            <Button href={publicUrl} target="_blank">
              <ExternalLinkIcon className="h-4 w-4" />
              View public page
            </Button>
          ) : null
        }
      />

      {/* Profile */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Profile</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <SingleImageUploader
            image={cv.photo}
            onChange={(img) => patch({ photo: img })}
            label="Profile photo"
            rounded="full"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <Input
                value={cv.fullName}
                onChange={(e) => patch({ fullName: e.target.value })}
              />
            </Field>
            <Field label="Title / role">
              <Input
                value={cv.title}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="Frontend Developer"
              />
            </Field>
          </div>
          <Field label="Bio">
            <Textarea
              value={cv.bio}
              onChange={(e) => patch({ bio: e.target.value })}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Location">
              <Input
                value={cv.location}
                onChange={(e) => patch({ location: e.target.value })}
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={cv.email}
                onChange={(e) => patch({ email: e.target.value })}
              />
            </Field>
          </div>
          <Field
            label="Public URL slug"
            hint={publicUrl ? `Your page: ${publicUrl}` : "e.g. jane-doe"}
          >
            <Input
              value={cv.slug}
              onChange={(e) => patch({ slug: slugify(e.target.value) })}
              placeholder="jane-doe"
            />
          </Field>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Skills</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              placeholder="Add a skill and press Enter"
            />
            <Button onClick={addSkill} variant="outline">
              Add
            </Button>
          </div>
          {cv.skills.length ? (
            <div className="flex flex-wrap gap-2">
              {cv.skills.map((s) => (
                <button
                  key={s}
                  onClick={() => removeSkill(s)}
                  className="group inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                >
                  {s}
                  <TrashIcon className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No skills added yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold">Projects</h2>
          <Button variant="outline" size="sm" onClick={addProject}>
            <PlusIcon className="h-4 w-4" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {cv.projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects yet.</p>
          ) : (
            cv.projects.map((p) => (
              <div
                key={p.id}
                className="space-y-3 rounded-xl border border-border p-4"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-3">
                    <Input
                      value={p.name}
                      onChange={(e) =>
                        updateProject(p.id, { name: e.target.value })
                      }
                      placeholder="Project name"
                    />
                    <Textarea
                      value={p.description}
                      onChange={(e) =>
                        updateProject(p.id, { description: e.target.value })
                      }
                      placeholder="Description"
                    />
                    <Input
                      value={p.link ?? ""}
                      onChange={(e) =>
                        updateProject(p.id, { link: e.target.value })
                      }
                      placeholder="https://… (optional)"
                    />
                  </div>
                  <button
                    onClick={() => removeProject(p.id)}
                    className="rounded-lg p-1.5 text-muted-foreground transition hover:text-red-500"
                    aria-label="Remove project"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold">Education</h2>
          <Button variant="outline" size="sm" onClick={addEducation}>
            <PlusIcon className="h-4 w-4" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {cv.education.length === 0 ? (
            <p className="text-sm text-muted-foreground">No education added.</p>
          ) : (
            cv.education.map((e) => (
              <div
                key={e.id}
                className="flex items-start gap-2 rounded-xl border border-border p-4"
              >
                <div className="grid flex-1 gap-3 sm:grid-cols-3">
                  <Input
                    value={e.school}
                    onChange={(ev) =>
                      updateEducation(e.id, { school: ev.target.value })
                    }
                    placeholder="School"
                  />
                  <Input
                    value={e.degree}
                    onChange={(ev) =>
                      updateEducation(e.id, { degree: ev.target.value })
                    }
                    placeholder="Degree"
                  />
                  <Input
                    value={e.period}
                    onChange={(ev) =>
                      updateEducation(e.id, { period: ev.target.value })
                    }
                    placeholder="2019–2023"
                  />
                </div>
                <button
                  onClick={() => removeEducation(e.id)}
                  className="rounded-lg p-1.5 text-muted-foreground transition hover:text-red-500"
                  aria-label="Remove education"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Social links */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold">Social links</h2>
          <Button variant="outline" size="sm" onClick={addSocial}>
            <PlusIcon className="h-4 w-4" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {cv.socials.length === 0 ? (
            <p className="text-sm text-muted-foreground">No links yet.</p>
          ) : (
            cv.socials.map((s) => (
              <div
                key={s.id}
                className="flex items-start gap-2 rounded-xl border border-border p-4"
              >
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <Input
                    value={s.label}
                    onChange={(ev) =>
                      updateSocial(s.id, { label: ev.target.value })
                    }
                    placeholder="LinkedIn"
                  />
                  <Input
                    value={s.url}
                    onChange={(ev) =>
                      updateSocial(s.id, { url: ev.target.value })
                    }
                    placeholder="https://…"
                  />
                </div>
                <button
                  onClick={() => removeSocial(s.id)}
                  className="rounded-lg p-1.5 text-muted-foreground transition hover:text-red-500"
                  aria-label="Remove link"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {publicUrl ? (
        <div className="rounded-2xl border border-border bg-surface p-5 text-sm">
          <p className="font-medium">Your public CV is ready</p>
          <p className="mt-1 text-muted-foreground">
            Share it at{" "}
            <Link href={publicUrl} className="text-primary underline">
              {publicUrl}
            </Link>
            . The page reads from this browser&apos;s local data.
          </p>
        </div>
      ) : (
        <Badge variant="warning">
          Set a public URL slug above to publish your CV.
        </Badge>
      )}
    </div>
  );
}
