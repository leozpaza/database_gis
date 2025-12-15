import { Router } from 'express';
import prisma from '../utils/db.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { page = '1', limit = '10', categoryId } = req.query;
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = { isPublished: true };
    if (categoryId) where.categoryId = categoryId as string;

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { updatedAt: 'desc' },
        include: { category: true, author: { select: { name: true } } }
      }),
      prisma.article.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        articles,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/popular', async (_req, res, next) => {
  try {
    const articles = await prisma.article.findMany({
      where: { isPublished: true },
      orderBy: { viewCount: 'desc' },
      take: 10,
      include: { category: true }
    });
    res.json({ success: true, data: articles });
  } catch (err) {
    next(err);
  }
});

router.get('/recent', async (_req, res, next) => {
  try {
    const articles = await prisma.article.findMany({
      where: { isPublished: true },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      include: { category: true }
    });
    res.json({ success: true, data: articles });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const article = await prisma.article.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: true,
        author: { select: { name: true } },
        appeals: { take: 5, select: { appealText: true, responseText: true } }
      }
    });

    if (!article) {
      return next(new AppError('Article not found', 404));
    }

    // Increment view count
    await prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } }
    });

    res.json({ success: true, data: article });
  } catch (err) {
    next(err);
  }
});

export { router as articleRoutes };
