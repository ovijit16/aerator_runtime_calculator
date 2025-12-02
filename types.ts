export interface AeratorLog {
  id: string;
  aerator_device_serial: string;
  on_off_status: '0' | '1';
  created_at: string; // e.g., "2025-10-26 04:13:35"
}

export interface ProcessedResult {
  'Device Serial': string;
  'Date': string;
  'Aerator Up Duration': string;
  'Total Up Time': string;
}

export interface ProcessedData {
  results: ProcessedResult[];
  grandTotal: string;
}

export type MultiDayProcessedData = Record<string, ProcessedData>;

export interface TimePair {
  start: Date;
  end: Date;
}