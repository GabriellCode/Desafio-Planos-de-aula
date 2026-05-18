import Fastify from 'fastify';
import cors from '@fastify/cors';
import { healthRoutes } from './routes/health.js';
import { lessonPlanRoutes } from './routes/lessonPlans.js';
import { aiRoutes } from './routes/ai.js';
import { studentRoutes } from './routes/students.js';
import { reportRoutes } from './routes/reports.js';

const server = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
    },
  },
});

async function start() {
  try {
    await server.register(cors, {
      origin: '*', // For demo purposes, we allow all origins
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    });

    server.register(healthRoutes, { prefix: '/health' });
    server.register(studentRoutes, { prefix: '/students' });
    server.register(reportRoutes, { prefix: '/reports' });
    server.register(lessonPlanRoutes, { prefix: '/lesson-plans' });
    server.register(aiRoutes, { prefix: '/ai' });

    const port = process.env.PORT || 3000;
    
    const startServer = async (retryCount = 0) => {
      try {
        await server.listen({ port, host: '0.0.0.0' });
        server.log.info(`Server listening on http://localhost:${port}`);
      } catch (err) {
        if (err.code === 'EADDRINUSE' && retryCount < 5) {
          server.log.warn(`Porta ${port} ocupada pelo restart do Windows. Tentando novamente em 1 segundo... (Tentativa ${retryCount + 1}/5)`);
          setTimeout(() => startServer(retryCount + 1), 1000);
        } else {
          server.log.error(err);
          process.exit(1);
        }
      }
    };

    startServer();
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
