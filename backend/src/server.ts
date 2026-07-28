import app from './app.js';
import { prisma } from './db.js';
import { execSync } from 'child_process';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    console.log('🔄 Syncing database schema...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('✅ Database schema in sync.');
  } catch (err) {
    console.error('⚠️  prisma db push failed (will attempt to continue):', err);
  }

  await prisma.$connect();
  console.log('✅ Database connected.');

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`⚡ Owshika Billing Backend running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});
