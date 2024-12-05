import React from 'react';

interface TrainingLogsProps {
  logs: string[];
}

export function TrainingLogs({ logs }: TrainingLogsProps) {
  if (logs.length === 0) return null;

  return (
    <div className="mt-4 rounded-lg bg-gray-900 p-4">
      <h3 className="mb-2 text-sm font-medium text-white">Training Logs</h3>
      <div className="max-h-40 overflow-y-auto">
        {logs.map((log, index) => (
          <div key={index} className="text-sm text-gray-300">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}