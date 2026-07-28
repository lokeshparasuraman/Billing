import app from './app.js';
import { prisma } from './db.js';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to Neon PostgreSQL database.');

    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`⚡ Owshika Billing Backend running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  }
}

bootstrap();
