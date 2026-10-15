import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ktPath = path.resolve(process.cwd(), 'kt.md');
    const tcPath = path.resolve(process.cwd(), 'tc.md');
    const ktContent = fs.existsSync(ktPath) ? fs.readFileSync(ktPath, 'utf-8') : '';
    const tcContent = fs.existsSync(tcPath) ? fs.readFileSync(tcPath, 'utf-8') : '';
    return res.status(200).json({ ktContent, tcContent });
  } catch (err: any) {
    console.error('Error reading md files on Vercel:', err);
    return res.status(500).json({ error: err.message || 'Error reading files' });
  }
}
