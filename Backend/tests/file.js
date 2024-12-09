function findAvailableSlot(userSchedules, meetingDuration, startHour, endHour) {
    const dayStart = new Date().setHours(startHour, 0, 0, 0); // e.g., 9:00 AM
    const dayEnd = new Date().setHours(endHour, 0, 0, 0);     // e.g., 5:00 PM
    const timeIncrement = 30 * 60 * 1000; // Checking in 30-minute intervals

    // Convert user schedules into arrays of busy slots in milliseconds
    const userBusySlots = userSchedules.map(schedule => 
        schedule.map(slot => [new Date(slot.start).getTime(), new Date(slot.end).getTime()])
    );

    // Iterate through possible slots in the day
    for (let time = dayStart; time + meetingDuration <= dayEnd; time += timeIncrement) {
        const meetingEnd = time + meetingDuration;

        // Check if all users are free during this slot
        const isFreeForAll = userBusySlots.every(schedule =>
            schedule.every(([busyStart, busyEnd]) => meetingEnd <= busyStart || time >= busyEnd)
        );

        if (isFreeForAll) {
            return { start: new Date(time), end: new Date(meetingEnd) };
        }
    }

    return null; // No common free slot found
}

// Example usage
const userSchedules = [
    [{ start: '2024-11-10T09:00:00', end: '2024-11-10T10:00:00' }],
    [{ start: '2024-11-10T10:30:00', end: '2024-11-10T11:00:00' }],
    [{ start: '2024-11-10T09:30:00', end: '2024-11-10T10:30:00' }]
];

const meetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds
const startHour = 9; // 9:00 AM
const endHour = 17;  // 5:00 PM

const result = findAvailableSlot(userSchedules, meetingDuration, startHour, endHour);
if (result) {
    console.log(`Suggested meeting time: ${result.start} to ${result.end}`);
} else {
    console.log("No available time slot found for all users.");
}
