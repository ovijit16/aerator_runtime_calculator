
import React, { useRef } from 'react';
import { UploadCloudIcon, FileJsonIcon } from './Icons';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type === 'application/json') {
      onFileSelect(file);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label
        htmlFor="file-upload"
        className="relative block w-full rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 p-8 text-center hover:border-slate-400 dark:hover:border-slate-500 transition-colors cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          accept=".json"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        {selectedFile ? (
          <div className="flex flex-col items-center justify-center text-slate-700 dark:text-slate-300">
            <FileJsonIcon className="h-12 w-12 text-emerald-500" />
            <span className="mt-2 block text-sm font-semibold">{selectedFile.name}</span>
            <p className="text-xs text-slate-500 dark:text-slate-400">Click again to change file</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
            <UploadCloudIcon className="h-12 w-12" />
            <span className="mt-2 block text-sm font-semibold">
              Click to upload or drag and drop
            </span>
            <p className="text-xs">JSON log file</p>
          </div>
        )}
      </label>
    </div>
  );
};

export default FileUpload;
