import { AeratorLog, ProcessedResult, TimePair, ProcessedData, MultiDayProcessedData } from '../types';

const TIMEZONE = 'Asia/Dhaka';
// Dhaka Standard Time is UTC+6 and does not observe Daylight Saving Time.
const DHAKA_UTC_OFFSET_MS = 6 * 60 * 60 * 1000;

// Helper to parse 'YYYY-MM-DD HH:MM:SS' assuming it's UTC
const parseUTCDate = (dateString: string): Date => {
  return new Date(dateString.replace(' ', 'T') + 'Z');
};

const formatDateInDhaka = (date: Date): string => {
  return new Intl.DateTimeFormat('en-CA', { // 'en-CA' gives YYYY-MM-DD
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const formatTimeInDhaka = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
        timeZone: TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    }).toLowerCase();
};

const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 0) milliseconds = 0;

  let totalSeconds = Math.floor(milliseconds / 1000);
  let hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;

  return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
};

const processSingleDayLogs = (
    dayLogs: AeratorLog[], 
    deviceSerial: string, 
    filterDateStr: string,
    initialOnTime: Date | null
): { processedData: ProcessedData | null, endedInOnState: boolean } => {
    
    const sortedLogs = dayLogs.sort((a, b) => 
        parseUTCDate(a.created_at).getTime() - parseUTCDate(b.created_at).getTime()
    );
      
    const timePairs: TimePair[] = [];
    let onTime: Date | null = initialOnTime;
    let endedInOnState = false;
  
    for (const log of sortedLogs) {
      const timestamp = parseUTCDate(log.created_at);
      if (log.on_off_status === '1' && !onTime) {
        onTime = timestamp;
      } else if (log.on_off_status === '0' && onTime) {
        timePairs.push({ start: onTime, end: timestamp });
        onTime = null;
      }
    }
  
    if (onTime) {
      endedInOnState = true;
      const [year, month, day] = filterDateStr.split('-').map(s => parseInt(s, 10));
      // Start of the *next* day in UTC. month - 1 because Date.UTC month is 0-indexed.
      const startOfNextDayUTC = new Date(Date.UTC(year, month - 1, day + 1));
      // The start of the next day in Dhaka is 6 hours before UTC midnight of the next day.
      const startOfNextDayInDhaka = new Date(startOfNextDayUTC.getTime() - DHAKA_UTC_OFFSET_MS);
      // The end of the current day is 1 millisecond before the start of the next day.
      const endOfDay = new Date(startOfNextDayInDhaka.getTime() - 1);

      timePairs.push({ start: onTime, end: endOfDay });
    }

    if (timePairs.length === 0) {
      return { processedData: null, endedInOnState };
    }
  
    const results: ProcessedResult[] = timePairs.map(pair => {
      const upTimeMs = pair.end.getTime() - pair.start.getTime();
      return {
        'Device Serial': deviceSerial,
        'Date': filterDateStr,
        'Aerator Up Duration': `${formatTimeInDhaka(pair.start)} – ${formatTimeInDhaka(pair.end)}`,
        'Total Up Time': formatDuration(upTimeMs),
      };
    });
  
    const totalUptimeMs = timePairs.reduce((total, pair) => {
      return total + (pair.end.getTime() - pair.start.getTime());
    }, 0);
  
    const processedData = {
      results,
      grandTotal: formatDuration(totalUptimeMs),
    };

    return { processedData, endedInOnState };
}


export const processAeratorLogs = (
  logs: AeratorLog[],
  deviceSerial: string,
  fromDateStr: string,
  toDateStr: string
): MultiDayProcessedData | null => {
  if (!logs || logs.length === 0 || !deviceSerial || !fromDateStr || !toDateStr) {
    return null;
  }

  const allDeviceLogs = logs
    .filter(log => log.aerator_device_serial === deviceSerial)
    .sort((a, b) => parseUTCDate(a.created_at).getTime() - parseUTCDate(b.created_at).getTime());
  
  if (allDeviceLogs.length === 0) {
    return null;
  }

  // Determine initial "ON" state from before the date range.
  // The start of fromDateStr in Dhaka is fromDateStr 00:00 GMT+6, which is fromDateStrT00:00Z - 6 hours in UTC.
  const startOfRangeMs = new Date(fromDateStr).getTime() - DHAKA_UTC_OFFSET_MS;
  
  let lastLogBeforeRange: AeratorLog | undefined;
  // Find the last log with a timestamp *strictly before* the start of our date range.
  for (let i = allDeviceLogs.length - 1; i >= 0; i--) {
      if (parseUTCDate(allDeviceLogs[i].created_at).getTime() < startOfRangeMs) {
          lastLogBeforeRange = allDeviceLogs[i];
          break;
      }
  }

  let isStillOnFromPreviousDay = lastLogBeforeRange?.on_off_status === '1';

  // Group logs within the date range by their date in Dhaka time.
  const logsByDate: Record<string, AeratorLog[]> = {};
  for (const log of allDeviceLogs) {
    const timestamp = parseUTCDate(log.created_at);
    const logDateInDhaka = formatDateInDhaka(timestamp);
    
    if (logDateInDhaka >= fromDateStr && logDateInDhaka <= toDateStr) {
        if (!logsByDate[logDateInDhaka]) {
            logsByDate[logDateInDhaka] = [];
        }
        logsByDate[logDateInDhaka].push(log);
    }
  }

  if (Object.keys(logsByDate).length === 0) {
    return null;
  }
  
  const resultsByDate: MultiDayProcessedData = {};
  const sortedDates = Object.keys(logsByDate).sort();

  for (const date of sortedDates) {
      let initialOnTime: Date | null = null;
      if (isStillOnFromPreviousDay) {
          // Calculate the start of the current day in Dhaka time
          const startOfDayUTC = new Date(date); // e.g., "2025-10-26" becomes 2025-10-26T00:00:00.000Z
          const startOfDayDhaka = new Date(startOfDayUTC.getTime() - DHAKA_UTC_OFFSET_MS);
          initialOnTime = startOfDayDhaka;
      }

      const dailyLogs = logsByDate[date] || [];
      const dailyResult = processSingleDayLogs(dailyLogs, deviceSerial, date, initialOnTime);
      
      if (dailyResult.processedData) {
          resultsByDate[date] = dailyResult.processedData;
      }
      isStillOnFromPreviousDay = dailyResult.endedInOnState;
  }

  if (Object.keys(resultsByDate).length === 0) {
      return null;
  }

  return resultsByDate;
};