import { type AuditAction, type ModerationTarget, Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";

interface LogAuditParams {
  actorId: string;
  action: AuditAction;
  targetType: ModerationTarget;
  targetId: string;
  reason?: string;
  metadata?: Prisma.InputJsonValue;
  /** Whether this entry is visible in the public modlog. Defaults to true. */
  public?: boolean;
}

/**
 * Append an entry to the immutable audit log.
 * Fire-and-forget — awaited by callers that need strict ordering, but safe to
 * call without await where the audit write is non-critical.
 */
export async function logAudit(params: LogAuditParams): Promise<void> {
  await prisma.auditLogEntry.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      reason: params.reason ?? null,
      metadata: params.metadata ?? Prisma.JsonNull,
      public: params.public ?? true,
    },
  });
}
