import { logger } from "../../config/logger";

interface AuditLogInput {
  actorId: string;
  action: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Placeholder audit trail. Today this writes to the structured logger
 * (which, in production, ships to centralized log storage). Once an
 * `AuditLog` Prisma model exists, swap the body of `record()` for a
 * `prisma.auditLog.create(...)` call — no callers need to change.
 */
class AuditService {
  async record(input: AuditLogInput): Promise<void> {
    logger.info(`AUDIT: ${input.action}`, {
      actorId: input.actorId,
      targetId: input.targetId,
      metadata: input.metadata,
    });
  }
}

export const auditService = new AuditService();
