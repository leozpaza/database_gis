import { Router } from 'express';
import prisma from '../utils/db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const {
      q = '',
      categoryId,
      hasTemplate,
      sortBy = 'relevance',
      sortOrder = 'desc',
      page = '1',
      limit = '20'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;
    const query = (q as string).trim().toLowerCase();

    const where: any = { isPublished: true };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { summary: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { keywords: { hasSome: query.split(' ') } },
        { category: { code: { contains: query, mode: 'insensitive' } } }
      ];
    }

    if (categoryId) where.categoryId = categoryId as string;
    if (hasTemplate === 'true') where.responseTemplate = { not: null };

    const orderBy: any = {};
    switch (sortBy) {
      case 'date': orderBy.updatedAt = sortOrder; break;
      case 'views': orderBy.viewCount = sortOrder; break;
      case 'title': orderBy.title = sortOrder; break;
      default: orderBy.viewCount = 'desc';
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: { category: true }
      }),
      prisma.article.count({ where })
    ]);

    // Track search query
    if (query) {
      await prisma.searchHistory.upsert({
        where: { query },
        create: { query },
        update: { count: { increment: 1 }, updatedAt: new Date() }
      }).catch(() => {});
    }

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

router.get('/suggestions', async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    const query = (q as string).trim().toLowerCase();

    if (query.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const articles = await prisma.article.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { keywords: { hasSome: [query] } }
        ]
      },
      take: 5,
      select: { id: true, title: true, slug: true, category: { select: { name: true } } }
    });

    res.json({ success: true, data: articles });
  } catch (err) {
    next(err);
  }
});

router.get('/popular-queries', async (_req, res, next) => {
  try {
    const queries = await prisma.searchHistory.findMany({
      orderBy: { count: 'desc' },
      take: 10,
      select: { query: true, count: true }
    });
    res.json({ success: true, data: queries });
  } catch (err) {
    next(err);
  }
});

export { router as searchRoutes };
