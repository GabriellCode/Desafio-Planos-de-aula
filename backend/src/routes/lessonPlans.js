import { prisma } from '../lib/prisma.js';
import { z } from 'zod';

const lessonPlanSchema = z.object({
  title: z.string(),
  objective: z.string(),
  summary: z.string(),
  expectedDate: z.string().datetime(),
  subject: z.string(),
  contents: z.string(),
  resources: z.string(),
  tags: z.string(),
  studentId: z.string().optional().nullable(),
});

export async function lessonPlanRoutes(server) {
  server.get('/', async (request, reply) => {
    try {
      const { 
        studentId, page = 1, limit = 6, 
        title, subject, tags, expectedDate, 
        sortBy = 'createdAt', sortOrder = 'desc' 
      } = request.query;
      
      const pageNumber = parseInt(page, 10) || 1;
      const pageSize = parseInt(limit, 10) || 6;
      const skip = (pageNumber - 1) * pageSize;

      const whereClause = {};
      if (studentId) whereClause.studentId = studentId;
      if (title) whereClause.title = { contains: title };
      if (subject) whereClause.subject = { contains: subject };
      if (tags) whereClause.tags = { contains: tags };
      if (expectedDate) {
        // Match exact date or we can do start of day
        // For simplicity, we assume exact ISO string or we do string comparison
        const dateObj = new Date(expectedDate);
        if (!isNaN(dateObj)) {
            // Because SQLite stores ISO string dates, exact match might be tricky,
            // but we'll use Prisma's exact match or range.
            whereClause.expectedDate = {
              gte: new Date(dateObj.setHours(0,0,0,0)),
              lte: new Date(dateObj.setHours(23,59,59,999)),
            };
        }
      }

      const orderByClause = {};
      if (['title', 'createdAt', 'expectedDate', 'order'].includes(sortBy)) {
        orderByClause[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
      } else {
        orderByClause.order = 'asc';
      }

      const [totalItems, plans] = await prisma.$transaction([
        prisma.lessonPlan.count({ where: whereClause }),
        prisma.lessonPlan.findMany({
          where: whereClause,
          orderBy: orderByClause,
          skip,
          take: pageSize,
          include: { student: true } // Include student relation
        })
      ]);

      const totalPages = Math.ceil(totalItems / pageSize);

      return reply.send({ 
        data: plans,
        meta: {
          totalItems,
          totalPages,
          currentPage: pageNumber,
          pageSize
        }
      });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  server.get('/:id', async (request, reply) => {
    try {
      const plan = await prisma.lessonPlan.findFirst({
        where: { id: request.params.id },
      });
      if (!plan) {
        return reply.status(404).send({ error: 'Lesson plan not found' });
      }
      return reply.send(plan);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  server.post('/', async (request, reply) => {
    try {
      const data = lessonPlanSchema.parse(request.body);
      
      // Convert empty string to null if passed
      if (!data.studentId) {
        data.studentId = null;
      }

      const maxOrderPlan = await prisma.lessonPlan.findFirst({
        where: { studentId: data.studentId },
        orderBy: { order: 'desc' },
      });
      const order = maxOrderPlan ? maxOrderPlan.order + 1 : 0;

      const plan = await prisma.lessonPlan.create({ 
        data: { ...data, order }
      });
      return reply.status(201).send(plan);
    } catch (error) {
      server.log.error(error);
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Erro de Validação', details: error.errors });
      }
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  server.put('/:id', async (request, reply) => {
    try {
      const data = lessonPlanSchema.parse(request.body);
      
      if (!data.studentId) {
        data.studentId = null;
      }

      const plan = await prisma.lessonPlan.update({
        where: { id: request.params.id },
        data: { ...data },
      });
      
      return reply.send({ success: true });
    } catch (error) {
      server.log.error(error);
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Erro de Validação', details: error.errors });
      }
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  server.delete('/:id', async (request, reply) => {
    try {
      await prisma.lessonPlan.delete({
        where: { id: request.params.id },
      });
      return reply.status(204).send();
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  const reorderSchema = z.array(z.object({
    id: z.string(),
    order: z.number().int(),
  }));

  server.put('/reorder', async (request, reply) => {
    try {
      const items = reorderSchema.parse(request.body);
      
      const transactions = items.map(item => 
        prisma.lessonPlan.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      );

      await prisma.$transaction(transactions);
      return reply.send({ success: true });
    } catch (error) {
      server.log.error(error);
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Erro de Validação', details: error.errors });
      }
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}
