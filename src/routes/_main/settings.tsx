import { useState, useEffect } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-auth";
import { useUserProfile, useUpdateProfile } from "@/hooks/use-users";
import { ImageUpload } from "@/components/shared/image-upload";
import { PageHeader } from "@/components/shared/page-header";
import type { Upload } from "@/types";

export const Route = createFileRoute("/_main/settings")({
  head: () => ({ meta: [{ title: "Settings | Cebu Airsoft Hub" }] }),
  beforeLoad: ({ context, location }) => {
    if (!context.session?.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: SettingsPage,
});

function SettingsPage() {
  const { data: session } = useCurrentUser();
  const username = session?.user?.username ?? "";
  const { data: profile, isLoading } = useUserProfile(username);
  const updateProfile = useUpdateProfile(username);

  const [bio, setBio] = useState("");
  const [playStyle, setPlayStyle] = useState("");
  const [avatarUploads, setAvatarUploads] = useState<Upload[]>([]);
  const [coverUploads, setCoverUploads] = useState<Upload[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Populate form fields once the profile loads
  useEffect(() => {
    if (profile && !hasInitialized) {
      setBio(profile.bio ?? "");
      setPlayStyle(profile.playStyle ?? "");
      setHasInitialized(true);
    }
  }, [profile, hasInitialized]);

  function handleSave() {
    const avatarUrl = avatarUploads[0]?.url ?? null;
    const coverUrl = coverUploads[0]?.url ?? null;

    updateProfile.mutate(
      {
        bio: bio.trim() || undefined,
        playStyle: playStyle.trim() || undefined,
        ...(avatarUrl !== null ? { avatar: avatarUrl } : {}),
        ...(coverUrl !== null ? { coverPhoto: coverUrl } : {}),
      },
      {
        onSuccess: () => toast.success("Profile updated"),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Failed to save changes"),
      },
    );
  }

  if (isLoading || !profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="h-6 w-48 animate-pulse rounded bg-muted/30 mb-8" />
        <div className="h-64 animate-pulse rounded border border-border bg-card" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PageHeader eyebrow="Account" title="Settings" className="mb-8" />

      <div className="flex flex-col gap-6">

        {/* Avatar */}
        <section className="border border-border bg-card p-6">
          <h2 className="label-military text-primary mb-1">Profile Picture</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Shown next to your name across the platform.
          </p>
          <div className="flex items-start gap-6">
            <div className="shrink-0">
              {(avatarUploads[0]?.url ?? profile.avatar) ? (
                <img
                  src={avatarUploads[0]?.url ?? profile.avatar}
                  alt="Avatar preview"
                  className="h-20 w-20 border border-border object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center border border-border bg-primary/10 text-2xl font-black text-primary">
                  {profile.name[0].toUpperCase()}
                </div>
              )}
            </div>
            <ImageUpload
              context="AVATAR"
              maxFiles={1}
              value={avatarUploads}
              onChange={setAvatarUploads}
              className="flex-1"
            />
          </div>
        </section>

        {/* Cover photo */}
        <section className="border border-border bg-card p-6">
          <h2 className="label-military text-primary mb-1">Cover Photo</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Banner image shown at the top of your profile page.
          </p>
          {(coverUploads[0]?.url ?? profile.coverPhoto) && (
            <div className="mb-3 aspect-[3/1] w-full overflow-hidden border border-border">
              <img
                src={coverUploads[0]?.url ?? profile.coverPhoto}
                alt="Cover preview"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <ImageUpload
            context="COVER_PHOTO"
            maxFiles={1}
            value={coverUploads}
            onChange={setCoverUploads}
          />
        </section>

        {/* Bio & play style */}
        <section className="border border-border bg-card p-6">
          <h2 className="label-military text-primary mb-4">Profile Info</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="label-military text-foreground mb-1.5 block" htmlFor="bio">
                Bio{" "}
                <span className="text-muted-foreground font-normal normal-case tracking-normal text-xs">
                  (optional)
                </span>
              </label>
              <textarea
                id="bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                placeholder="Tell the community about yourself…"
                className="w-full resize-none rounded border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
              />
              <p className="text-[11px] text-muted-foreground text-right mt-0.5">
                {bio.length}/500
              </p>
            </div>

            <div>
              <label className="label-military text-foreground mb-1.5 block" htmlFor="playStyle">
                Play Style{" "}
                <span className="text-muted-foreground font-normal normal-case tracking-normal text-xs">
                  (optional)
                </span>
              </label>
              <input
                id="playStyle"
                type="text"
                value={playStyle}
                onChange={(e) => setPlayStyle(e.target.value)}
                maxLength={100}
                placeholder="e.g. MilSim, CQB, Sniper…"
                className="h-10 w-full rounded border border-border bg-background px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="btn-primary px-6 py-2.5"
          >
            {updateProfile.isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
