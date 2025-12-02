import React from 'react';
import { ProcessedResult } from '../types';

interface ResultsTableProps {
  data: ProcessedResult[];
  grandTotal: string;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ data, grandTotal }) => {
  if (!data || data.length === 0) {
    return null;
  }

  const headers = Object.keys(data[0]);

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-md">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-100 dark:bg-slate-800">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header) => (
                <td
                  key={`${rowIndex}-${header}`}
                  className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300"
                >
                  {row[header as keyof ProcessedResult]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-slate-100 dark:bg-slate-800 border-t-2 border-slate-300 dark:border-slate-600">
            {/* Blank row for spacing */}
            <tr>
                <td colSpan={headers.length} className="py-2"></td>
            </tr>
            {/* Grand Total row */}
            <tr>
                <td colSpan={3} className="px-6 py-4 text-right font-bold text-sm text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Grand Total
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800 dark:text-slate-200">
                    {grandTotal}
                </td>
            </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default ResultsTable;