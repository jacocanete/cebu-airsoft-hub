import { useState } from "react";
import { MoreHorizontal, Trash2, Pin, PinOff, Lock, Unlock, RotateCcw, Flag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RemovalReasonDialog } from "@/components/shared/removal-reason-dialog";

interface ContentActionsMenuProps {
  /** Whether the current user owns this content */
  isOwner: boolean;
  /** Whether the current user is a mod/admin */
  isModerator: boolean;
  /** Whether the content is currently soft-deleted */
  isRemoved: boolean;
  /** Whether the content is currently pinned (posts only) */
  isPinned?: boolean;
  /** Whether the content is currently locked (posts only) */
  isLocked?: boolean;
  /** Whether to show post-only actions (pin, lock) */
  isPost?: boolean;

  onDelete?: () => void;
  onRemove?: (reason: string) => void;
  onRestore?: () => void;
  onPin?: () => void;
  onLock?: () => void;

  isPendingRemove?: boolean;
  isPendingDelete?: boolean;
  isPendingRestore?: boolean;
  targetLabel?: string;
}

export function ContentActionsMenu({
  isOwner,
  isModerator,
  isRemoved,
  isPinned = false,
  isLocked = false,
  isPost = false,
  onDelete,
  onRemove,
  onRestore,
  onPin,
  onLock,
  isPendingRemove = false,
  isPendingDelete = false,
  isPendingRestore = false,
  targetLabel = "content",
}: ContentActionsMenuProps) {
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  const showOwnerActions = isOwner && !isRemoved;
  const showModActions = isModerator;
  const hasActions = showOwnerActions || showModActions;

  if (!hasActions) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="More actions"
            className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-44">
          {/* Owner actions */}
          {showOwnerActions && onDelete && (
            <DropdownMenuItem
              onSelect={onDelete}
              disabled={isPendingDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Delete
            </DropdownMenuItem>
          )}

          {/* Separator between owner and mod actions */}
          {showOwnerActions && showModActions && !isOwner && (
            <DropdownMenuSeparator />
          )}

          {/* Mod actions */}
          {isModerator && (
            <>
              {!isRemoved && onRemove && (
                <DropdownMenuItem
                  onSelect={() => setRemoveDialogOpen(true)}
                  disabled={isPendingRemove}
                  className="text-destructive focus:text-destructive"
                >
                  <Flag className="h-3.5 w-3.5 mr-2" />
                  Remove
                </DropdownMenuItem>
              )}

              {isRemoved && onRestore && (
                <DropdownMenuItem
                  onSelect={onRestore}
                  disabled={isPendingRestore}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-2" />
                  Restore
                </DropdownMenuItem>
              )}

              {isPost && onPin && (
                <DropdownMenuItem onSelect={onPin}>
                  {isPinned ? (
                    <>
                      <PinOff className="h-3.5 w-3.5 mr-2" />
                      Unpin
                    </>
                  ) : (
                    <>
                      <Pin className="h-3.5 w-3.5 mr-2" />
                      Pin
                    </>
                  )}
                </DropdownMenuItem>
              )}

              {isPost && onLock && (
                <DropdownMenuItem onSelect={onLock}>
                  {isLocked ? (
                    <>
                      <Unlock className="h-3.5 w-3.5 mr-2" />
                      Unlock
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5 mr-2" />
                      Lock
                    </>
                  )}
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Removal reason dialog — shown when mod clicks Remove */}
      <RemovalReasonDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        onConfirm={(reason) => {
          setRemoveDialogOpen(false);
          onRemove?.(reason);
        }}
        isPending={isPendingRemove}
        targetLabel={targetLabel}
      />
    </>
  );
}
