import { prisma } from '../lib/prisma.js';
import { z } from 'zod';

const reportSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
});

export async function reportRoutes(server) {
  server.get('/', async (request, reply) => {
    const { studentId } = request.query;
    try {
      const where = studentId ? { studentId } : {};
      const reports = await prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      return reply.send({ data: reports });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  server.get('/:id', async (request, reply) => {
    try {
      const report = await prisma.report.findUnique({
        where: { id: request.params.id },
      });
      if (!report) {
        return reply.status(404).send({ error: 'Report not found' });
      }
      return reply.send(report);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  server.post('/', async (request, reply) => {
    try {
      const data = reportSchema.parse(request.body);
      const report = await prisma.report.create({ data });
      return reply.status(201).send(report);
    } catch (error) {
      server.log.error(error);
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ errors: error.errors });
      }
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  server.put('/:id', async (request, reply) => {
    try {
      const data = reportSchema.parse(request.body);
      const report = await prisma.report.update({
        where: { id: request.params.id },
        data,
      });
      return reply.send(report);
    } catch (error) {
      server.log.error(error);
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ errors: error.errors });
      }
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  server.delete('/:id', async (request, reply) => {
    try {
      await prisma.report.delete({
        where: { id: request.params.id },
      });
      return reply.status(204).send();
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}
