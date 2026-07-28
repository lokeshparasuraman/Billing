// Vercel serverless function handler
// This file must NOT use .js extension imports — Vercel bundles TypeScript directly
import app from '../backend/src/app';

export default function handler(req: any, res: any) {
  return app(req, res);
}
