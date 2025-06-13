import { Request, Response } from 'express';
import License from '../models/License';

export const handleLicensePing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, project } = req.params;

    const rawIP = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || 'unknown';
    const ip = rawIP.replace(/[.:]/g, '_'); // sanitize IPv4 and IPv6

    if (!userId || !project) {
      console.log('Missing params:', req.params);
      res.status(400).json({ error: 'Missing userId or project' });
      return;
    }

    let license = await License.findOne({ userId, project });
    const now = new Date();

    if (!license) {
      license = new License({
        userId,
        project,
        status: 'Normal',
        totalRequests: 1,
        requestCounts: {
          [ip]: { count: 1, lastSeen: now }
        },
        requests: [{ ip, timestamp: now }]
      });
    } else {
      license.totalRequests += 1;

      license.requestCounts ??= {};
      license.requestCounts[ip] ??= { count: 0, lastSeen: now };

      license.requestCounts[ip].count += 1;
      license.requestCounts[ip].lastSeen = now;

      license.requests.push({ ip, timestamp: now });

      if (license.requests.length > 1000) {
        license.requests.splice(0, license.requests.length - 1000);
      }

      // ✅ tell mongoose to track both objects properly
      license.markModified('requestCounts');
      license.markModified('requests');
    }

    await license.save();

    res.status(200).json({
      message: '✅ License ping successful',
      userId,
      project,
      ip: rawIP,
      totalRequests: license.totalRequests,
      ipRequestCount: license.requestCounts[ip].count,
      status: license.status
    });

  } catch (err) {
    console.error('License tracking error:', err);
    res.status(500).json({ error: '❌ Server error while tracking license' });
  }
};
