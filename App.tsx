import React, { useState, useCallback } from 'react';
// FIX: Import ProcessedData for type casting.
import { AeratorLog, MultiDayProcessedData, ProcessedData } from './types';
import { processAeratorLogs } from './services/logProcessor';
import FileUpload from './components/FileUpload';
import FilterControls from './components/FilterControls';
import ResultsTable from './components/ResultsTable';
import ExportButton from './components/ExportButton';
import { LoaderIcon } from './components/Icons';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logs, setLogs] = useState<AeratorLog[]>([]);
  const [deviceSerial, setDeviceSerial] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [processedData, setProcessedData] = useState<MultiDayProcessedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setError(null);
    setProcessedData(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const data = JSON.parse(text);
          if (Array.isArray(data)) {
            setLogs(data);
          } else {
            setError('Invalid JSON format. Expected an array of log objects.');
            setLogs([]);
          }
        }
      } catch (err) {
        setError('Failed to parse JSON file.');
        setLogs([]);
      }
    };
    reader.onerror = () => {
        setError('Failed to read file.');
        setLogs([]);
    };
    reader.readAsText(file);
  }, []);

  const handleProcess = () => {
    if (!logs.length || !deviceSerial || !fromDate || !toDate) {
      setError('Please upload a file and fill in device serial, from date, and to date.');
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      setError('"From Date" cannot be after "To Date".');
      return;
    }
    setError(null);
    setIsLoading(true);
    setProcessedData(null);

    // Simulate processing time for better UX
    setTimeout(() => {
        const result = processAeratorLogs(logs, deviceSerial, fromDate, toDate);
        if (result && Object.keys(result).length > 0) {
            setProcessedData(result);
        } else {
            setError('No valid ON/OFF activity found for the specified device and date range.');
        }
        setIsLoading(false);
    }, 500);
  };

  const isFormDisabled = !selectedFile;
  const canProcess = selectedFile && deviceSerial && fromDate && toDate;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Aerator Runtime Calculator
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Upload your JSON log file to calculate daily aerator uptime.
          </p>
        </header>

        <main className="space-y-8">
          <div className="bg-white dark:bg-slate-800/50 shadow-lg rounded-xl p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">Step 1: Upload Log File</h2>
            <FileUpload onFileSelect={handleFileSelect} selectedFile={selectedFile} />
          </div>

          <div className="bg-white dark:bg-slate-800/50 shadow-lg rounded-xl p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">Step 2: Set Filters & Process</h2>
            <FilterControls
              deviceSerial={deviceSerial}
              setDeviceSerial={setDeviceSerial}
              fromDate={fromDate}
              setFromDate={setFromDate}
              toDate={toDate}
              setToDate={setToDate}
              disabled={isFormDisabled}
            />
            <div className="pt-2">
                <button
                    onClick={handleProcess}
                    disabled={!canProcess || isLoading}
                    className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? (
                        <>
                            <LoaderIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                            Processing...
                        </>
                    ) : (
                        'Calculate Runtime'
                    )}
                </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {processedData && (
            <div className="bg-white dark:bg-slate-800/50 shadow-lg rounded-xl p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Results</h2>
                    <ExportButton 
                        data={processedData} 
                        fileName={`aerator_report_${deviceSerial}_${fromDate}_to_${toDate}`} 
                    />
                </div>
                <div className="space-y-8">
                {/* FIX: Cast dataForDate to ProcessedData to resolve TypeScript errors when accessing its properties. */}
                {Object.entries(processedData).map(([date, dataForDate]) => {
                  const typedDataForDate = dataForDate as ProcessedData;
                  return (
                    <div key={date}>
                        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
                            Report for: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{date}</span>
                        </h3>
                        <ResultsTable data={typedDataForDate.results} grandTotal={typedDataForDate.grandTotal} />
                    </div>
                  );
                })}
                </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;