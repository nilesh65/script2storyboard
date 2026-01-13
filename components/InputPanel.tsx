import React, { useState } from 'react';
import { ParsingStatus } from '../types';

interface InputPanelProps {
  onProcess: (script: string) => void;
  status: ParsingStatus;
}

const InputPanel: React.FC<InputPanelProps> = ({ onProcess, status }) => {
  const [script, setScript] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (script.trim()) {
      onProcess(script);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-800 rounded-xl shadow-xl border border-slate-700">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">1. Input Script</h2>
        <p className="text-slate-400">Paste your script text below. Gemini AI will break it into storyboard sequences automatically.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full h-64 p-4 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
          placeholder="INT. LIVING ROOM - DAY&#10;&#10;JOHN walks in. He looks tired.&#10;&#10;JOHN&#10;I can't believe it's finally over."
          value={script}
          onChange={(e) => setScript(e.target.value)}
          disabled={status.isLoading}
        />

        <div className="flex items-center justify-end gap-4">
          {status.error && (
            <span className="text-red-400 text-sm">{status.error}</span>
          )}
          
          <button
            type="submit"
            disabled={status.isLoading || !script.trim()}
            className={`
              px-6 py-2 rounded-lg font-semibold text-white transition-all
              ${status.isLoading || !script.trim() 
                ? 'bg-slate-600 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/20 active:transform active:scale-95'}
            `}
          >
            {status.isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Generate Storyboard Sheets'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputPanel;