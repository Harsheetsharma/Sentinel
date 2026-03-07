import { Queue } from "bullmq";

const monitorQueue = new Queue("monitor-queue", {
    connection: { host: "localhost", port: 6379 }
})

export const scheduleMonitor = async (monitorId: string, frequency: number) => {

    await monitorQueue.add(
        `monitor-${monitorId}`,
        { monitorId },
        {
            repeat: {
                every: frequency * 60 * 1000 //convert the minutes to miliseconds
            },
            jobId: monitorId,// Using monitorId as JobId prevents duplicate schedules
        }
    );
    console.log(`✅ Scheduled monitor ${monitorId} every ${frequency} minutes.`);
}

export const removeMonitorSchedule = async (monitorId: string) => {
    // Important for when a user deletes or pauses a monitor
    await monitorQueue.removeRepeatable(`monitor-${monitorId}`, {
        every: 1 * 60 * 1000, // This needs to match the exact pattern it was created with
    });
};