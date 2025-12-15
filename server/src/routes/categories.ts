import { Router } from 'express';
import prisma from '../utils/db.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { articles: { where: { isPublished: true } } } }
      }
    });

    const formatted = categories.map((cat: any) => ({
      ...cat,
      articleCount: cat._count.articles,
      children: cat.children.map((child: any) => ({ ...child }))
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: {
        children: { orderBy: { sortOrder: 'asc' } },
        articles: {
          where: { isPublished: true },
          orderBy: { updatedAt: 'desc' },
          include: { author: { select: { name: true } } }
        },
        parent: true
      }
    });

    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
});

export { router as categoryRoutes };
