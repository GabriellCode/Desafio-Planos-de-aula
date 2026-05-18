export async function healthRoutes(server) {
  server.get('/', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });
}
