import { createClient } from 'redis';

const redisClient = createClient({
  socket: {
    host: 'localhost',
    port: 7000,
  }
});

redisClient.connect().catch((err) => {
  console.error('Erro ao conectar ao Redis:', err);
});

redisClient.on('error', (err) => {
  console.error('Redis error: ', err);
});

export { redisClient }
