-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedByAuthor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deletedById" TEXT,
ADD COLUMN     "deletionReason" TEXT;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedByAuthor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deletedById" TEXT,
ADD COLUMN     "deletionReason" TEXT,
ADD COLUMN     "locked" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
