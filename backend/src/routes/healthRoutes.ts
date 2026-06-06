import express from 'express';

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint for uptime monitoring
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 service:
 *                   type: string
 *                   example: "lawyers-diary-backend"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-06-06T12:30:45.123Z"
 */
router.get('/', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'lawyers-diary-backend',
        timestamp: new Date().toISOString(),
    });
});

export default router;
