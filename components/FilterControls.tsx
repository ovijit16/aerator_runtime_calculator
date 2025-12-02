import React from 'react';

interface FilterControlsProps {
  deviceSerial: string;
  setDeviceSerial: (value: string) => void;
  fromDate: string;
  setFromDate: (value: string) => void;
  toDate: string;
  setToDate: (value: string) => void;
  disabled: boolean;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  deviceSerial,
  setDeviceSerial,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  disabled,
}) => {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
        <label htmlFor="device-serial" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Device Serial
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="device-serial"
            id="device-serial"
            className="block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-slate-900 dark:text-slate-200 disabled:opacity-50 py-3 px-4"
            placeholder="e.g., 050609I0J789ND22"
            value={deviceSerial}
            onChange={(e) => setDeviceSerial(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
      <div>
        <label htmlFor="from-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          From Date
        </label>
        <div className="mt-1">
          <input
            type="date"
            name="from-date"
            id="from-date"
            className="block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-slate-900 dark:text-slate-200 disabled:opacity-50 py-3 px-4"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
      <div>
        <label htmlFor="to-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          To Date
        </label>
        <div className="mt-1">
          <input
            type="date"
            name="to-date"
            id="to-date"
            className="block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-slate-900 dark:text-slate-200 disabled:opacity-50 py-3 px-4"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

export default FilterControls;