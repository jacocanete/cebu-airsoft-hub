import { useState, useMemo } from "react";
import { Lock, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";
import type { CSSProperties } from "react";
import { ImageUpload } from "@/components/shared/image-upload";
import { GroupLogo } from "@/components/groups/group-logo";
import { useUpdateGroup } from "@/hooks/use-groups";
import type { GroupDetail, JoinPolicy, Upload } from "@/types";

const BANNER_PLACEHOLDER: CSSProperties = {
  background:
    "linear-gradient(135deg, oklch(0.45 0.27 25 / 30%) 0%, oklch(0.15 0 0) 60%, oklch(0.1 0 0) 100%)",
};

function urlToUpload(url: string | null, context: "GROUP_LOGO" | "GROUP_BANNER"): Upload[] {
  if (!url) return [];
  return [
    {
      id: url,
      key: url,
      thumbKey: null,
      url,
      thumbUrl: null,
      filename: "current",
      mimeType: "image/webp",
      size: 0,
      width: null,
      height: null,
      context,
      uploaderId: "",
      createdAt: new Date().toISOString(),
    },
  ];
}

export function GeneralTab({ group }: { group: GroupDetail }) {
  const [description, setDescription] = useState(group.description ?? "");
  const [joinPolicy, setJoinPolicy] = useState<JoinPolicy>(group.joinPolicy);
  const [logo, setLogo] = useState<Upload[]>(() =>
    urlToUpload(group.logo, "GROUP_LOGO"),
  );
  const [banner, setBanner] = useState<Upload[]>(() =>
    urlToUpload(group.banner, "GROUP_BANNER"),
  );

  const update = useUpdateGroup(group.slug);

  const isDirty = useMemo(() => {
    return (
      description.trim() !== (group.description ?? "") ||
      joinPolicy !== group.joinPolicy ||
      (logo[0]?.url ?? null) !== group.logo ||
      (banner[0]?.url ?? null) !== group.banner
    );
  }, [description, joinPolicy, logo, banner, group]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    update.mutate(
      {
        description: description.trim() || null,
        joinPolicy,
        logo: logo[0]?.url ?? null,
        banner: banner[0]?.url ?? null,
      },
      {
        onSuccess: () => toast.success("Group updated"),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Failed to update"),
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
          placeholder="What's this unit about?"
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
            name={group.name}
            logo={logo[0]?.url ?? group.logo}
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
          {(banner[0]?.url ?? group.banner) ? (
            <img
              src={banner[0]?.url ?? group.banner ?? undefined}
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
                Anyone can request. Admins approve or decline.
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
          disabled={!isDirty || update.isPending}
          className="rounded bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/85 transition-colors disabled:opacity-60"
        >
          {update.isPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
