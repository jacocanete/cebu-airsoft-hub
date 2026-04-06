-- CreateEnum
CREATE TYPE "UploadContext" AS ENUM ('AVATAR', 'COVER_PHOTO', 'POST_IMAGE', 'LISTING_IMAGE', 'GROUP_LOGO', 'GROUP_BANNER');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "images" TEXT[];

-- CreateTable
CREATE TABLE "Upload" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "thumbKey" TEXT,
    "url" TEXT NOT NULL,
    "thumbUrl" TEXT,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "context" "UploadContext" NOT NULL,
    "uploaderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Upload_key_key" ON "Upload"("key");

-- CreateIndex
CREATE INDEX "Upload_uploaderId_context_idx" ON "Upload"("uploaderId", "context");

-- CreateIndex
CREATE INDEX "Upload_context_idx" ON "Upload"("context");

-- AddForeignKey
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
