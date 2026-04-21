import { useState } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { BarChart2, Shield } from "lucide-react";
import { toast } from "sonner";
import { useCreatePost } from "@/hooks/use-posts";
import { useGroupDetail } from "@/hooks/use-groups";
import { PostEditor } from "@/components/feed/post-editor";
import { PollBuilder } from "@/components/feed/poll-builder";
import { TagInput } from "@/components/feed/tag-input";
import { ImageUpload } from "@/components/shared/image-upload";
import type { PollDraft, Upload } from "@/types";
import { FORUM_CATEGORIES } from "@/lib/constants";
import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";
import { getCachedSession } from "@/lib/queries/session";

export const Route = createFileRoute("/_main/feed/new")({
  validateSearch: (search: Record<string, unknown>) => ({
    groupSlug: typeof search.groupSlug === "string" ? search.groupSlug : undefined,
  }),
  head: () => ({
    meta: [{ title: "Create Post | Cebu Airsoft Hub" }],
  }),
  beforeLoad: ({ context, location }) => {
    const session = getCachedSession(context.queryClient);
    if (!session?.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: NewPostPage,
});

function NewPostPage() {
  const { groupSlug } = Route.useSearch();
  const { data: group } = useGroupDetail(groupSlug ?? "");
  const postingToGroup = !!groupSlug && !!group;

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  // Group posts skip the category selector — default to "General" server-side.
  const [category, setCategory] = useState(groupSlug ? "General" : "");
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<Upload[]>([]);
  const [poll, setPoll] = useState<PollDraft | null>(null);

  const addPoll = () => {
    if (poll) return;
    setPoll({
      question: "",
      options: [
        { id: crypto.randomUUID(), text: "" },
        { id: crypto.randomUUID(), text: "" },
      ],
      multiSelect: false,
      expiryHours: 24,
    });
  };

  const navigate = Route.useNavigate();
  const createPost = useCreatePost();

  const canSubmit = title.trim().length > 0 && body.trim().length > 0 && category;

  function handleSubmit() {
    createPost.mutate(
      {
        title: title.trim(),
        content: body.trim(),
        category,
        tags,
        images: images.map((u) => u.url),
        ...(poll ? { poll } : {}),
        ...(groupSlug ? { groupSlug } : {}),
      },
      {
        onSuccess: (data) => {
          const { id } = data as { id: string };
          toast.success("Post created");
          navigate({ to: "/feed/$id", params: { id } });
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to create post");
        },
      },
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {postingToGroup ? (
        <Link
          to="/groups/$slug"
          params={{ slug: groupSlug! }}
          className="mb-6 inline-flex items-center gap-1.5 label-military transition-colors hover:text-primary"
        >
          ← Back to {group.name}
        </Link>
      ) : (
        <BackLink to="/feed" label="Back to Forum" />
      )}

      <div className="mb-8">
        <PageHeader
          eyebrow={postingToGroup ? group.name : "Forum"}
          title="Create a Post"
        />
      </div>

      {postingToGroup && (
        <div className="mb-5 inline-flex items-center gap-2 rounded border border-primary/30 bg-primary/5 px-3 py-2">
          <Shield className="h-4 w-4 text-primary" />
          <p className="text-xs text-foreground">
            Posting in <span className="font-bold">{group.name}</span> — visible to
            members only.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="label-military text-foreground" htmlFor="title">Title <span className="text-primary">*</span></label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Write a descriptive title..." maxLength={200} className="input-field" />
          <p className="text-[11px] text-muted-foreground text-right">{title.length}/200</p>
        </div>

        {!postingToGroup && (
          <div className="flex flex-col gap-1.5">
            <label className="label-military text-foreground" htmlFor="category">Category <span className="text-primary">*</span></label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
              <option value="">Select a category...</option>
              {FORUM_CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="post-body" className="label-military text-foreground">Body <span className="text-primary">*</span></label>
          <PostEditor id="post-body" value={body} onChange={setBody} placeholder="Write your post... Markdown is supported." minRows={12} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="label-military text-foreground">
            Images{" "}
            <span className="text-muted-foreground font-normal normal-case tracking-normal text-xs">
              (optional, up to 10)
            </span>
          </label>
          <ImageUpload
            context="POST_IMAGE"
            maxFiles={10}
            value={images}
            onChange={setImages}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="label-military text-foreground" htmlFor="tags">
            Tags{" "}
            <span className="text-muted-foreground font-normal normal-case tracking-normal text-xs">
              (optional, press Enter or comma to add)
            </span>
          </label>
          <TagInput id="tags" tags={tags} onChange={setTags} />
        </div>

        {poll ? (
          <PollBuilder value={poll} onChange={setPoll} onRemove={() => setPoll(null)} />
        ) : (
          <button type="button" onClick={addPoll} className="self-start inline-flex items-center gap-1.5 rounded border border-border px-3 py-2 label-military text-muted-foreground hover:bg-accent hover:text-foreground hover:border-primary/50 transition-colors">
            <BarChart2 className="h-4 w-4" />
            Add a Poll
          </button>
        )}

        <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">By posting, you agree to the community rules.</p>
          <div className="flex gap-2">
            {postingToGroup ? (
              <Link
                to="/groups/$slug"
                params={{ slug: groupSlug! }}
                className="btn-ghost"
              >
                Cancel
              </Link>
            ) : (
              <Link to="/feed" search={{ tag: undefined, sort: "new", category: "All" }} className="btn-ghost">
                Cancel
              </Link>
            )}
            <button
              type="button"
              disabled={!canSubmit || createPost.isPending}
              onClick={handleSubmit}
              className="btn-primary"
            >
              {createPost.isPending ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
