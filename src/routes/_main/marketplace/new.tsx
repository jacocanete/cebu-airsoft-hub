import { useState } from "react";
import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCreateListing } from "@/hooks/use-marketplace";
import { ImageUpload } from "@/components/shared/image-upload";
import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";
import { MARKETPLACE_CATEGORIES } from "@/lib/constants";

const CONDITION_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "USED", label: "Used" },
  { value: "FOR_PARTS", label: "For Parts" },
] as const;
import type { Upload } from "@/types";

export const Route = createFileRoute("/_main/marketplace/new")({
  head: () => ({ meta: [{ title: "Sell an Item | Cebu Airsoft Hub" }] }),
  beforeLoad: ({ context, location }) => {
    if (!context.session?.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: NewListingPage,
});

function NewListingPage() {
  const navigate = Route.useNavigate();
  const createListing = useCreateListing();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState<Upload[]>([]);

  const canSubmit =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    Number(price) > 0 &&
    condition &&
    category &&
    !createListing.isPending;

  function handleSubmit() {
    createListing.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        condition,
        category,
        images: images.map((u) => u.url),
      },
      {
        onSuccess: (data) => {
          const { id } = data as { id: string };
          toast.success("Listing created");
          navigate({ to: "/marketplace/$id", params: { id } });
        },
        onError: (err) => {
          const msg = err instanceof Error ? err.message : String(err);
          toast.error(msg || "Failed to create listing");
        },
      },
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <BackLink to="/marketplace" label="Back to Marketplace" />

      <PageHeader eyebrow="Marketplace" title="Sell an Item" className="mb-8" />

      <div className="flex flex-col gap-5">

        {/* Images */}
        <div className="flex flex-col gap-1.5">
          <label className="label-military text-foreground">
            Photos{" "}
            <span className="text-muted-foreground font-normal normal-case tracking-normal text-xs">
              (up to 10)
            </span>
          </label>
          <ImageUpload
            context="LISTING_IMAGE"
            maxFiles={10}
            value={images}
            onChange={setImages}
          />
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="label-military text-foreground" htmlFor="title">
            Title <span className="text-primary">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="e.g. Tokyo Marui MWS GBBR — excellent condition"
            className="input-field"
          />
          <p className="text-[11px] text-muted-foreground text-right">{title.length}/200</p>
        </div>

        {/* Condition + Category row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="label-military text-foreground" htmlFor="condition">
              Condition <span className="text-primary">*</span>
            </label>
            <select
              id="condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="input-field"
            >
              <option value="">Select condition…</option>
              {CONDITION_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label-military text-foreground" htmlFor="category">
              Category <span className="text-primary">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field"
            >
              <option value="">Select category…</option>
              {MARKETPLACE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price */}
        <div className="flex flex-col gap-1.5">
          <label className="label-military text-foreground" htmlFor="price">
            Price (₱) <span className="text-primary">*</span>
          </label>
          <input
            id="price"
            type="number"
            min="1"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 12000"
            className="input-field"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="label-military text-foreground" htmlFor="description">
            Description <span className="text-primary">*</span>
          </label>
          <textarea
            id="description"
            rows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the item — include specs, modifications, included accessories, reason for selling…"
            className="resize-none rounded border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-primary focus:ring-1 placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            By listing, you agree to the marketplace rules.
          </p>
          <div className="flex gap-2">
            <Link
              to="/marketplace"
              search={{ category: "All", condition: "All" }}
              className="btn-ghost"
            >
              Cancel
            </Link>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="btn-primary"
            >
              {createListing.isPending ? "Listing…" : "List Item"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
