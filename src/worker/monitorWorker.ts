import { Worker } from 'bullmq';
import { prisma } from '@sentinel/db';
import { SentinelEngine } from '../engine/runner';
import { compareNewOldData } from '../utils/diffEngine';

const engine = new SentinelEngine();

// Initialize the engine once per worker process
engine.init();

export const monitorWorker = new Worker('monitor-queue', async (job: any) => {
    const { monitorId, url, selector } = job.data;

    try {
        // 1. Get the current Monitor config and its last value
        const monitor = await prisma.monitor.findUnique({ where: { id: monitorId } });
        if (!monitor) return;

        // 2. Execute the crawl
        const { content } = await engine.executeTask(url, selector);

        // 3. Compare with the last value stored in the DB
        const diff = compareNewOldData({
            oldvalue: monitor.lastValue || "",
            newvalue: content || ""
        });

        // 4. Update the DB with the result
        await prisma.$transaction([
            prisma.observation.create({
                data: {
                    monitorId,
                    value: String(content),
                    difference: diff.difference,
                    hasChanged: diff.haschanged,
                }
            }),
            prisma.monitor.update({
                where: { id: monitorId },
                data: {
                    lastValue: String(content),
                    lastChecked: new Date()
                }
            })
        ]);

        // 5. Logic: If it changed, send an alert! (We'll do this next)
        if (diff.haschanged) {
            console.log(`🚨 Change detected for ${monitor.name}: ${diff.difference}%`);
        }

    } catch (error) {
        console.error(`❌ Worker failed for job ${job.id}:`, error);
        throw error; // Let BullMQ handle the retry
    }
}, {
    connection: { host: 'localhost', port: 6379 }
});