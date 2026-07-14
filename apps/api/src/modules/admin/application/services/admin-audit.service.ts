import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class AdminAuditService {
  constructor(private readonly prisma: PrismaService) {}

  log(params: { adminId: string; action: string; entity: string; entityId?: string; ip?: string | null }) {
    return this.prisma.adminLog.create({
      data: {
        adminId: params.adminId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        ip: params.ip ?? undefined,
      },
    });
  }

  list(limit = 50) {
    return this.prisma.adminLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 200),
      include: { admin: { select: { email: true } } },
    });
  }
}
