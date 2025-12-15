import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import * as XLSX from 'xlsx';
import prisma from '../utils/db.js';
import { authenticate, requireEditor, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const articleSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(3).max(200),
  summary: z.string().min(10).max(500),
  content: z.string().min(20),
  responseTemplate: z.string().optional(),
  legalReference: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false)
});

const categorySchema = z.object({
  code: z.string().min(1),
  name: z.string().min(2),
  description: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().uuid().optional().nullable(),
  sortOrder: z.number().int().default(0)
});

function slugify(text: string): string {
  return text.toLowerCase()
    .replace(/[а-яё]/g, c => {
      const map: Record<string, string> = {а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'};
      return map[c] || c;
    })
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Articles CRUD
router.get('/articles', authenticate, requireEditor, async (req, res, next) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, parseInt(limit as string));

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { updatedAt: 'desc' },
        include: { category: true, author: { select: { name: true } } }
      }),
      prisma.article.count()
    ]);

    res.json({ success: true, data: { articles, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (err) { next(err); }
});

router.post('/articles', authenticate, requireEditor, async (req: AuthRequest, res, next) => {
  try {
    const data = articleSchema.parse(req.body);
    const slug = slugify(data.title) + '-' + Date.now().toString(36);

    const article = await prisma.article.create({
      data: { ...data, slug, authorId: req.userId! },
      include: { category: true }
    });

    res.status(201).json({ success: true, data: article });
  } catch (err) { next(err); }
});

router.put('/articles/:id', authenticate, requireEditor, async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = articleSchema.partial().parse(req.body);

    const article = await prisma.article.update({
      where: { id },
      data,
      include: { category: true }
    });

    res.json({ success: true, data: article });
  } catch (err) { next(err); }
});

router.delete('/articles/:id', authenticate, requireEditor, async (req, res, next) => {
  try {
    await prisma.article.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Article deleted' });
  } catch (err) { next(err); }
});

// Categories CRUD
router.get('/categories', authenticate, requireEditor, async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { articles: true } } }
    });
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
});

router.post('/categories', authenticate, requireEditor, async (req, res, next) => {
  try {
    const data = categorySchema.parse(req.body);
    const slug = slugify(data.name);

    const category = await prisma.category.create({
      data: { ...data, slug }
    });

    res.status(201).json({ success: true, data: category });
  } catch (err) { next(err); }
});

router.put('/categories/:id', authenticate, requireEditor, async (req, res, next) => {
  try {
    const data = categorySchema.partial().parse(req.body);
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data
    });
    res.json({ success: true, data: category });
  } catch (err) { next(err); }
});

router.delete('/categories/:id', authenticate, requireEditor, async (req, res, next) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) { next(err); }
});

// Excel Import
router.post('/import', authenticate, requireEditor, upload.single('file'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const result = { success: 0, errors: 0, skipped: 0, details: [] as string[] };

    // Process appeals sheet
    const appealsSheet = workbook.Sheets['Обращения'] || workbook.Sheets[workbook.SheetNames[0]];
    if (appealsSheet) {
      const appeals = XLSX.utils.sheet_to_json(appealsSheet) as any[];

      for (const row of appeals) {
        try {
          const code = String(row['Код темы'] || row['Код'] || '0.0');
          const gisId = String(row['ID'] || row['Идентификатор'] || `gen-${Date.now()}-${Math.random().toString(36).slice(2)}`);

          // Find or create category
          let category = await prisma.category.findUnique({ where: { code } });
          if (!category) {
            const name = String(row['Тема'] || row['Тема обращения'] || `Тема ${code}`);
            category = await prisma.category.create({
              data: { code, name, slug: slugify(name) || `cat-${code.replace('.', '-')}` }
            });
          }

          // Create appeal
          await prisma.appeal.upsert({
            where: { gisId },
            create: {
              gisId,
              number: String(row['Номер'] || row['№'] || ''),
              categoryId: category.id,
              appealText: String(row['Текст обращения'] || row['Содержание'] || ''),
              responseText: String(row['Текст ответа'] || ''),
              address: String(row['Адрес'] || '')
            },
            update: {
              appealText: String(row['Текст обращения'] || row['Содержание'] || ''),
              responseText: String(row['Текст ответа'] || '')
            }
          });

          result.success++;
        } catch (err: any) {
          result.errors++;
          result.details.push(`Row error: ${err.message}`);
        }
      }
    }

    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

// Stats
router.get('/stats', authenticate, requireEditor, async (_req, res, next) => {
  try {
    const [articles, categories, appeals, views] = await Promise.all([
      prisma.article.count(),
      prisma.category.count(),
      prisma.appeal.count(),
      prisma.article.aggregate({ _sum: { viewCount: true } })
    ]);

    res.json({
      success: true,
      data: { articles, categories, appeals, totalViews: views._sum.viewCount || 0 }
    });
  } catch (err) { next(err); }
});

export { router as adminRoutes };
