import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ktContent, tcContent } = req.body || {};
    const ktPath = path.resolve(process.cwd(), 'kt.md');
    const tcPath = path.resolve(process.cwd(), 'tc.md');

    try {
      if (typeof ktContent === 'string') {
        fs.writeFileSync(ktPath, ktContent, 'utf-8');
      }
      if (typeof tcContent === 'string') {
        fs.writeFileSync(tcPath, tcContent, 'utf-8');
      }
      return res.status(200).json({ success: true, message: 'Đã lưu thành công vào ổ cứng (kt.md & tc.md)' });
    } catch (fsErr: any) {
      // Vercel serverless filesystem is read-only in production
      console.warn('Vercel serverless read-only filesystem, returning success for client storage fallback:', fsErr.message);
      return res.status(200).json({
        success: true,
        message: 'Đã đồng bộ tri thức (Vercel serverless mode: lưu trình duyệt)',
        readOnly: true,
      });
    }
  } catch (err: any) {
    console.error('Error in save-md:', err);
    return res.status(500).json({ error: err.message || 'Error processing save' });
  }
}
