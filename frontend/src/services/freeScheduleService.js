const API_BASE_URL = 'http://localhost:3000/api/events';

export const getCalendarEvents = async (calendarId) => {
    const response = await fetch(`${API_BASE_URL}/${calendarId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
  
    if (!response.ok) {
      throw new Error('Error fetching events');
    }
  
    return await response.json();
  };

  function findFreeSlots(userSchedules, startDate, endDate) {
    const freeSlots = [];
    const busySlots = [];

    // Step 1: Collect all busy slots
    for (const user in userSchedules) {
        busySlots.push(...userSchedules[user]);
    }

    // Step 2: Sort busy slots by start time
    busySlots.sort((a, b) => new Date(a.start) - new Date(b.start));

    // Step 3: Merge overlapping busy slots
    const mergedBusySlots = [];
    for (const slot of busySlots) {
        if (
            mergedBusySlots.length > 0 &&
            new Date(slot.start) <= new Date(mergedBusySlots[mergedBusySlots.length - 1].end)
        ) {
            // Extend the last merged slot
            mergedBusySlots[mergedBusySlots.length - 1].end = new Date(Math.max(
                new Date(slot.end),
                new Date(mergedBusySlots[mergedBusySlots.length - 1].end)
            )).toISOString();
        } else {
            // Add a new slot
            mergedBusySlots.push({ start: slot.start, end: slot.end });
        }
    }

    // Step 4: Find free slots between merged busy slots
    let currentTime = new Date(startDate);

    for (const busySlot of mergedBusySlots) {
        const busyStart = new Date(busySlot.start);

        // If there's a gap between the current time and the next busy slot
        if (currentTime < busyStart) {
            freeSlots.push({
                start: currentTime.toISOString(),
                end: busyStart.toISOString(),
            });
        }

        // Move current time to the end of the busy slot
        currentTime = new Date(Math.max(currentTime, new Date(busySlot.end)));
    }

    // Add the remaining free time after the last busy slot
    if (currentTime < new Date(endDate)) {
        freeSlots.push({
            start: currentTime.toISOString(),
            end: new Date(endDate).toISOString(),
        });
    }

    return freeSlots;
}

// Example Usage:
const userSchedules = {
    user1: [
        { start: '2024-11-23T09:00:00Z', end: '2024-11-23T10:00:00Z' },
        { start: '2024-11-23T11:00:00Z', end: '2024-11-23T12:00:00Z' },
    ],
    user2: [
        { start: '2024-11-23T09:30:00Z', end: '2024-11-23T10:30:00Z' },
        { start: '2024-11-23T12:00:00Z', end: '2024-11-23T13:00:00Z' },
    ],
};

const startDate = '2024-11-23T08:00:00Z';
const endDate = '2024-11-23T14:00:00Z';

const freeSlots = findFreeSlots(userSchedules, startDate, endDate);
console.log('Free Slots:', freeSlots);
