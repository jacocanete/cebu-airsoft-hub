import { useState } from "react";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { BarChart2, X } from "lucide-react";
import { toast } from "sonner";
import { useCreatePost } from "@/hooks/use-posts";
import { PostEditor } from "@/components/feed/post-editor";
import { PollBuilder } from "@/components/feed/poll-builder";
import type { PollDraft } from "@/types";
import { FORUM_CATEGORIES } from "@/lib/constants";
import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";

export const Route = createFileRoute("/_main/feed/new")({
  head: () => ({
    meta: [{ title: "Create Post | Detachment Reaper" }],
  }),
  beforeLoad: ({ context, location }) => {
    if (!context.session?.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: NewPostPage,
});

function NewPostPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [poll, setPoll] = useState<PollDraft | null>(null);

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && tagsInput.trim()) {
      e.preventDefault();
      const tag = tagsInput.trim().replace(/^#/, "").toLowerCase();
      if (tag && !tags.includes(tag) && tags.length < 8) {
        setTags([...tags, tag]);
      }
      setTagsInput("");
    }
    if (e.key === "Backspace" && !tagsInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

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

  const navigate = useNavigate();
  const createPost = useCreatePost();

  const canSubmit = title.trim().length > 0 && body.trim().length > 0 && category;

  function handleSubmit() {
    createPost.mutate(
      {
        title: title.trim(),
        content: body.trim(),
        category,
        tags,
        ...(poll ? { poll } : {}),
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
      <BackLink to="/feed" label="Back to Forum" />

      <div className="mb-8"><PageHeader eyebrow="Forum" title="Create a Post" /></div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="label-military text-foreground" htmlFor="title">Title <span className="text-primary">*</span></label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Write a descriptive title..." maxLength={200} className="h-10 rounded border border-border bg-card px-3 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground" />
          <p className="text-[11px] text-muted-foreground/40 text-right">{title.length}/200</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="label-military text-foreground" htmlFor="category">Category <span className="text-primary">*</span></label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded border border-border bg-card px-3 text-sm text-foreground outline-none ring-primary focus:ring-1">
            <option value="">Select a category...</option>
            {FORUM_CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="label-military text-foreground">Body <span className="text-primary">*</span></label>
          <PostEditor value={body} onChange={setBody} placeholder="Write your post... Markdown is supported." minRows={12} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="label-military text-foreground" htmlFor="tags">Tags <span className="text-muted-foreground font-normal normal-case tracking-normal text-xs">(optional, press Enter or comma to add)</span></label>
          <div className="flex flex-wrap items-center gap-1.5 min-h-10 rounded border border-border bg-card px-3 py-1.5 focus-within:ring-1 focus-within:ring-primary">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                #{tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-primary/60 transition-colors"><X className="h-3 w-3" /></button>
              </span>
            ))}
            <input id="tags" type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder={tags.length === 0 ? "e.g. AEG, maintenance, CQB..." : ""} className="flex-1 min-w-[120px] bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
          </div>
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
            <Link to="/feed" className="rounded border border-border px-4 py-2 label-military text-muted-foreground hover:bg-accent transition-colors">Cancel</Link>
            <button
              type="button"
              disabled={!canSubmit || createPost.isPending}
              onClick={handleSubmit}
              className="rounded bg-primary px-4 py-2 label-military text-primary-foreground hover:bg-primary/85 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {createPost.isPending ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
