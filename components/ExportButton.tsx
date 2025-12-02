import React from 'react';
// FIX: Import ProcessedData for type casting, and remove unused ProcessedResult.
import { MultiDayProcessedData, ProcessedData } from '../types';
import { DownloadIcon } from './Icons';

// Let TypeScript know that XLSX is a global variable from the script tag
declare var XLSX: any;

interface ExportButtonProps {
  data: MultiDayProcessedData;
  fileName: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ data, fileName }) => {
  const exportToExcel = () => {
    if (!data || Object.keys(data).length === 0) return;

    const workbook = XLSX.utils.book_new();

    for (const [date, dailyData] of Object.entries(data)) {
      // FIX: Cast dailyData to ProcessedData to correctly destructure properties.
      const { results, grandTotal } = dailyData as ProcessedData;
      if (!results || results.length === 0) continue;

      // Add a blank row and then the grand total row
      const dataForExport = [
          ...results,
          {
              'Device Serial': '',
              'Date': '',
              'Aerator Up Duration': '',
              'Total Up Time': ''
          },
          {
              'Device Serial': '',
              'Date': '',
              'Aerator Up Duration': 'Grand Total',
              'Total Up Time': grandTotal
          }
      ];

      const worksheet = XLSX.utils.json_to_sheet(dataForExport, { skipHeader: false });
      
      // Auto-fit columns by finding the max length in each column
      const headers = Object.keys(dataForExport[0]);
      const colWidths = headers.map(header => {
        const maxLength = Math.max(
          header.length,
          ...dataForExport.map(row => String(row[header as keyof (typeof dataForExport[0])]).length)
        );
        return { wch: maxLength + 2 };
      });
      worksheet['!cols'] = colWidths;

      // Apply bold styling to the grand total row
      const grandTotalRowNumber = results.length + 3; // +1 for header, +1 for blank row, +1 because it's 1-based index
      const grandTotalLabelCellAddress = `C${grandTotalRowNumber}`;
      const grandTotalValueCellAddress = `D${grandTotalRowNumber}`;
      
      const boldStyle = { font: { bold: true } };

      if (worksheet[grandTotalLabelCellAddress]) {
          worksheet[grandTotalLabelCellAddress].s = boldStyle;
      } else {
          XLSX.utils.sheet_add_aoa(worksheet, [[{ v: 'Grand Total', s: boldStyle }]], { origin: `C${grandTotalRowNumber}` });
      }

      if (worksheet[grandTotalValueCellAddress]) {
          worksheet[grandTotalValueCellAddress].s = boldStyle;
      } else {
          XLSX.utils.sheet_add_aoa(worksheet, [[{ v: grandTotal, s: boldStyle }]], { origin: `D${grandTotalRowNumber}` });
      }
      
      XLSX.utils.book_append_sheet(workbook, worksheet, date);
    }
    
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  return (
    <button
      onClick={exportToExcel}
      className="inline-flex items-center justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
    >
      <DownloadIcon className="-ml-1 mr-2 h-5 w-5" />
      Export to Excel
    </button>
  );
};

export default ExportButton;