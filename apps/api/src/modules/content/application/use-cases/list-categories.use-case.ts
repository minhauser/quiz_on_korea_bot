import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

export interface CategoryNode {
  id: string;
  name: string;
  icon: string | null;
  difficulty: string;
  sortOrder: number;
  lessonCount: number;
  children: CategoryNode[];
}

@Injectable()
export class ListCategoriesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CategoryNode[]> {
    const categories = await this.prisma.vocabularyCategory.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { lessons: true } } },
    });

    const byId = new Map<string, CategoryNode>();
    for (const c of categories) {
      byId.set(c.id, {
        id: c.id,
        name: c.name,
        icon: c.icon,
        difficulty: c.difficulty,
        sortOrder: c.sortOrder,
        lessonCount: c._count.lessons,
        children: [],
      });
    }

    const roots: CategoryNode[] = [];
    for (const c of categories) {
      const node = byId.get(c.id)!;
      if (c.parentCategoryId && byId.has(c.parentCategoryId)) {
        byId.get(c.parentCategoryId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }
}
