import { prisma } from '../lib/prisma.js';
import { z } from 'zod';

const studentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
});

export async function studentRoutes(server) {
  server.get('/', async (request, reply) => {
    try {
      const students = await prisma.student.findMany({
        orderBy: { order: 'asc' },
      });
      return reply.send({ data: students });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  server.get('/:id', async (request, reply) => {
    try {
      const student = await prisma.student.findFirst({
        where: { id: request.params.id },
      });
      if (!student) {
        return reply.status(404).send({ error: 'Student not found' });
      }
      return reply.send(student);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  server.post('/', async (request, reply) => {
    try {
      const data = studentSchema.parse(request.body);
      
      const maxOrderStudent = await prisma.student.findFirst({
        orderBy: { order: 'desc' },
      });
      const order = maxOrderStudent ? maxOrderStudent.order + 1 : 0;
      
      const student = await prisma.student.create({ 
        data: { ...data, order }
      });
      return reply.status(201).send(student);
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
      const data = studentSchema.parse(request.body);
      const student = await prisma.student.update({
        where: { id: request.params.id },
        data,
      });
      return reply.send(student);
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
      await prisma.student.delete({
        where: { id: request.params.id },
      });
      return reply.status(204).send();
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  server.post('/reorder', async (request, reply) => {
    const items = request.body;
    if (!Array.isArray(items)) {
      return reply.status(400).send({ error: 'Expected an array of objects' });
    }

    try {
      const transactions = items.map((item) => 
        prisma.student.update({
          where: { id: item.id },
          data: { order: item.order }
        })
      );
      
      await prisma.$transaction(transactions);
      return reply.send({ success: true });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao reordenar alunos' });
    }
  });
}
