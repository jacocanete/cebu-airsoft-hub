-- AlterTable
ALTER TABLE "MarketplaceListing" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "featuredAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "MarketplaceListing_featured_featuredAt_idx" ON "MarketplaceListing"("featured", "featuredAt");
