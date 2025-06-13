// src/controllers/licenseController.ts
import { Request, Response } from 'express';
import License from '../models/License';

export const handleLicensePing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, project } = req.params;
    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || 'unknown';

    if (!userId || !project) {
      res.status(400).json({ error: 'Missing userId or project' });
      return;
    }

    let license = await License.findOne({ userId, project });

    if (!license) {
      license = new License({
        userId,
        project,
        status: 'Normal',
        totalRequests: 1,
        requestCounts: {
          [ip]: { count: 1, lastSeen: new Date() }
        },
        requests: [{
          ip,
          timestamp: new Date()
        }]
      });
    } else {
      license.totalRequests += 1;

      if (!license.requestCounts[ip]) {
        license.requestCounts[ip] = {
          count: 1,
          lastSeen: new Date()
        };
      } else {
        license.requestCounts[ip].count += 1;
        license.requestCounts[ip].lastSeen = new Date();
      }

      license.requests.push({
        ip,
        timestamp: new Date()
      });
    }

    await license.save();

    res.status(200).json({
      message: '✅ License ping successful',
      userId,
      project,
      ip,
      totalRequests: license.totalRequests,
      ipRequestCount: license.requestCounts[ip]?.count || 1,
      status: license.status
    });
  } catch (err) {
    console.error('License tracking error:', err);
    res.status(500).json({ error: '❌ Server error while tracking license' });
  }
};
