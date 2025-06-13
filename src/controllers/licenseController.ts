// src/controllers/licenseController.ts
import { Request, Response } from 'express';
import License from '../models/License';

export const handleLicensePing = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || 'unknown';
    
    if (!userId) {
      res.status(400).json({ error: 'Missing USER_ID' });
      return;
    }

    let license = await License.findOne({ userId });
    
    if (!license) {
      license = new License({
        userId,
        servers: [ip],
        requestCount: 1
      });
    } else {
      license.requestCount += 1;
      if (!license.servers.includes(ip)) {
        license.servers.push(ip);
      }
    }

    await license.save();
    
    res.status(200).json({
  message: 'License ping tracked',
  userId,
  ip,
  totalRequests: license.requestCount,
  uniqueServers: license.servers.length,
  status: license.status // ✅ include status
});

  } catch (err) {
    console.error('License tracking error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};