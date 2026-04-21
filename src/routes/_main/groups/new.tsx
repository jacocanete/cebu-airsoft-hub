import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Lock, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";
import type { CSSProperties } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { BackLink } from "@/components/shared/back-link";
import { ImageUpload } from "@/components/shared/image-upload";
import { GroupLogo } from "@/components/groups/group-logo";
import { useCreateGroup } from "@/hooks/use-groups";
import { getCachedSession } from "@/lib/queries/session";
import type { JoinPolicy, Upload } from "@/types";

const BANNER_PLACEHOLDER: CSSProperties = {
  background:
    "linear-gradient(135deg, oklch(0.45 0.27 25 / 30%) 0%, oklch(0.15 0 0) 60%, oklch(0.1 0 0) 100%)",
};

export const Route = createFileRoute("/_main/groups/new")({
  head: () => ({ meta: [{ title: "Register a Group | Cebu Airsoft Hub" }] }),
  beforeLoad: ({ context, location }) => {
    const session = getCachedSession(context.queryClient);
    if (!session?.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: NewGroupPage,
});

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}

function NewGroupPage() {
  const navigate = Route.useNavigate();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [joinPolicy, setJoinPolicy] = useState<JoinPolicy>("REQUEST");
  const [logo, setLogo] = useState<Upload[]>([]);
  const [banner, setBanner] = useState<Upload[]>([]);

  const create = useCreateGroup();

  const effectiveSlug = slugTouched ? slug : slugify(name);
  const slugValid = /^[a-z0-9-]+$/.test(effectiveSlug) && effectiveSlug.length > 0;
  const canSubmit = name.trim().length > 0 && slugValid;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    create.mutate(
      {
        name: name.trim(),
        slug: effectiveSlug,
        description: description.trim() || undefined,
        joinPolicy,
        logo: logo[0]?.url,
        banner: banner[0]?.url,
      },
      {
        onSuccess: (group) => {
          toast.success("Group created");
          navigate({ to: "/groups/$slug", params: { slug: group.slug } });
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Failed to create group"),
      },
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <BackLink to="/groups" label="All groups" />
      <PageHeader
        eyebrow="Units"
        title="Register a Group"
        description="Form up your team. You'll be the owner and can invite operators or approve requests."
        className="mb-8"
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label
            htmlFor="group-name"
            className="label-military text-foreground mb-1.5 block"
          >
            Name
          </label>
          <input
            id="group-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 100))}
            required
            placeholder="Taskforce Reaper"
            className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
          />
        </div>

        <div>
          <label
            htmlFor="group-slug"
            className="label-military text-foreground mb-1.5 block"
          >
            URL slug
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground shrink-0">
              /groups/
            </span>
            <input
              id="group-slug"
              type="text"
              value={effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, "")
                    .slice(0, 50),
                );
              }}
              required
              placeholder="taskforce-reaper"
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
            />
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Lowercase letters, numbers, and hyphens only. Can't be changed later.
          </p>
        </div>

        <div>
          <label
            htmlFor="group-description"
            className="label-military text-foreground mb-1.5 block"
          >
            Description
          </label>
          <textarea
            id="group-description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
            placeholder="What's this unit about? Play style, meetup frequency, requirements…"
            className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground resize-none"
          />
          <p className="mt-1 text-right text-[11px] text-muted-foreground">
            {description.length}/2000
          </p>
        </div>

        <div>
          <p className="label-military text-foreground mb-1.5">Logo</p>
          <div className="flex items-start gap-6">
            <GroupLogo
              name={name || "New group"}
              logo={logo[0]?.url}
              size="2xl"
              className="border border-border"
            />
            <ImageUpload
              context="GROUP_LOGO"
              maxFiles={1}
              value={logo}
              onChange={setLogo}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <p className="label-military text-foreground mb-1.5">Banner</p>
          <div className="mb-3 aspect-[3/1] w-full overflow-hidden border border-border">
            {banner[0]?.url ? (
              <img
                src={banner[0].url}
                alt="Banner preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full" style={BANNER_PLACEHOLDER} />
            )}
          </div>
          <ImageUpload
            context="GROUP_BANNER"
            maxFiles={1}
            value={banner}
            onChange={setBanner}
          />
        </div>

        <div>
          <p className="label-military text-foreground mb-2">Join policy</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setJoinPolicy("REQUEST")}
              aria-pressed={joinPolicy === "REQUEST"}
              className={`flex items-start gap-3 rounded border p-3 text-left transition-colors ${
                joinPolicy === "REQUEST"
                  ? "border-primary/60 bg-primary/5"
                  : "border-border bg-card hover:bg-accent"
              }`}
            >
              <UsersIcon className="mt-0.5 h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-foreground">
                  Request to join
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
                  Anyone can request. You approve or decline.
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setJoinPolicy("INVITE_ONLY")}
              aria-pressed={joinPolicy === "INVITE_ONLY"}
              className={`flex items-start gap-3 rounded border p-3 text-left transition-colors ${
                joinPolicy === "INVITE_ONLY"
                  ? "border-primary/60 bg-primary/5"
                  : "border-border bg-card hover:bg-accent"
              }`}
            >
              <Lock className="mt-0.5 h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-foreground">
                  Invite only
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
                  Only invited users can join. No public requests.
                </p>
              </div>
            </button>
          </div>
        </div>

        <div className="flex justify-end border-t border-border pt-4">
          <button
            type="submit"
            disabled={!canSubmit || create.isPending}
            className="rounded bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/85 transition-colors disabled:opacity-60"
          >
            {create.isPending ? "Creating…" : "Create group"}
          </button>
        </div>
      </form>
    </div>
  );
}
