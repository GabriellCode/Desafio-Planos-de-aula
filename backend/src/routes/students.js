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
        orderBy: { createdAt: 'desc' },
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
      const student = await prisma.student.create({ 
        data 
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
}
