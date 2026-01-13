import React from 'react';
import { StoryboardPanel } from '../types';

interface StoryboardEditorProps {
  panels: StoryboardPanel[];
  onUpdatePanel: (id: string, field: keyof StoryboardPanel, value: string) => void;
  onSavePDF: () => void;
  onReset: () => void;
  isSaving?: boolean;
}

const StoryboardEditor: React.FC<StoryboardEditorProps> = ({ panels, onUpdatePanel, onSavePDF, onReset, isSaving = false }) => {
  
  // Helper to chunk panels into pages of 3
  const pages = [];
  for (let i = 0; i < panels.length; i += 3) {
    pages.push(panels.slice(i, i + 3));
  }

  return (
    <div className="w-full flex flex-col items-center gap-8 pb-20">
      
      {/* Header Toolbar */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700 sticky top-4 z-40 shadow-2xl">
        <div>
          <h2 className="text-xl font-bold text-white">Document Preview</h2>
          <p className="text-sm text-slate-400">Edit directly on the pages below.</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
           <button 
            onClick={onReset}
            className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            Start Over
          </button>
          <button 
            onClick={onSavePDF}
            disabled={isSaving}
            className={`flex items-center gap-2 px-6 py-2 font-semibold rounded-lg shadow-lg transition-all 
              ${isSaving 
                ? 'bg-slate-600 text-slate-300 cursor-wait' 
                : 'bg-green-600 hover:bg-green-500 text-white shadow-green-600/20 hover:-translate-y-0.5'}`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving PDF...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Save as PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pages Container */}
      <div className="flex flex-col gap-8 w-full items-center">
        {pages.map((pagePanels, pageIndex) => (
          <div 
            key={pageIndex}
            className="bg-white text-black w-full max-w-[210mm] aspect-[210/297] shadow-2xl p-[10mm] flex flex-col relative transition-transform hover:scale-[1.005] duration-300"
          >
            {/* Page Header */}
            <div className="flex justify-between items-end border-b-2 border-black pb-2 mb-4 select-none">
              <div>
                <h1 className="text-xl font-bold uppercase tracking-wider">Storyboard Script</h1>
                <p className="text-sm text-gray-600">Edit Mode</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">Page {pageIndex + 1} of {pages.length}</div>
                <div className="text-xs text-gray-500">{new Date().toLocaleDateString()}</div>
              </div>
            </div>

            {/* Panels Grid */}
            <div className="flex-grow flex flex-col gap-6">
              {pagePanels.map((panel) => (
                <div key={panel.id} className="flex flex-row gap-4 border border-gray-800 p-2 h-[80mm] group hover:border-blue-400 transition-colors">
                  
                  {/* Left: Depiction Box (Visual) */}
                  <div className="w-1/2 flex flex-col gap-1">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Visual / Depiction</div>
                    <div className="flex-grow border-2 border-gray-300 rounded bg-gray-50 relative flex items-center justify-center">
                       <span className="absolute top-2 left-2 text-xs text-gray-400 font-mono">SEQ #{panel.sequenceNumber}</span>
                       <span className="text-gray-300 text-sm font-medium italic select-none">Draw Here</span>
                    </div>
                  </div>

                  {/* Right: Details Boxes */}
                  <div className="w-1/2 flex flex-col gap-2">
                    
                    {/* Script Segment (Read Only) */}
                    <div className="h-1/5 flex flex-col">
                       <div className="text-[10px] font-bold uppercase text-gray-500">Script Source</div>
                       <div className="text-xs italic bg-gray-100 p-1 border border-gray-200 h-full overflow-hidden leading-tight text-gray-600">
                          "{panel.scriptSegment.length > 150 ? panel.scriptSegment.substring(0, 150) + '...' : panel.scriptSegment}"
                       </div>
                    </div>

                    {/* Grid for writing details */}
                    <div className="h-4/5 grid grid-cols-2 gap-2">
                      
                      {/* Visual Prompt / Action */}
                      <div className="col-span-2 flex flex-col">
                        <div className="text-[10px] font-bold uppercase text-gray-500">Visual Prompt / Action</div>
                        <div className="flex-grow border-b border-gray-300 border-dashed relative overflow-hidden bg-blue-50/50 group-hover:bg-blue-50 transition-colors">
                          <textarea
                            value={panel.actionNotes}
                            onChange={(e) => onUpdatePanel(panel.id, 'actionNotes', e.target.value)}
                            className="w-full h-full bg-transparent resize-none outline-none text-xs font-serif p-1 text-black placeholder-gray-300"
                            placeholder="Describe the action..."
                          />
                        </div>
                      </div>

                      {/* Environment */}
                      <div className="flex flex-col">
                        <div className="text-[10px] font-bold uppercase text-gray-500">Environment</div>
                        <div className="flex-grow border-b border-gray-300 border-dashed bg-blue-50/50 group-hover:bg-blue-50 transition-colors">
                           <input
                            type="text"
                            value={panel.environmentNotes}
                            onChange={(e) => onUpdatePanel(panel.id, 'environmentNotes', e.target.value)}
                            className="w-full h-full bg-transparent outline-none text-xs font-serif p-1 text-black placeholder-gray-300"
                            placeholder="Setting..."
                           />
                        </div>
                      </div>

                      {/* Mood */}
                      <div className="flex flex-col">
                        <div className="text-[10px] font-bold uppercase text-gray-500">Mood</div>
                        <div className="flex-grow border-b border-gray-300 border-dashed bg-blue-50/50 group-hover:bg-blue-50 transition-colors">
                          <input
                            type="text"
                            value={panel.moodNotes}
                            onChange={(e) => onUpdatePanel(panel.id, 'moodNotes', e.target.value)}
                            className="w-full h-full bg-transparent outline-none text-xs font-serif p-1 text-black placeholder-gray-300"
                            placeholder="Mood..."
                           />
                        </div>
                      </div>

                      {/* Character */}
                      <div className="flex flex-col">
                        <div className="text-[10px] font-bold uppercase text-gray-500">Character(s)</div>
                        <div className="flex-grow border-b border-gray-300 border-dashed bg-blue-50/50 group-hover:bg-blue-50 transition-colors">
                           <input
                            type="text"
                            value={panel.characterNotes}
                            onChange={(e) => onUpdatePanel(panel.id, 'characterNotes', e.target.value)}
                            className="w-full h-full bg-transparent outline-none text-xs font-serif p-1 text-black placeholder-gray-300"
                            placeholder="Who?"
                           />
                        </div>
                      </div>

                      {/* Expression */}
                      <div className="flex flex-col">
                        <div className="text-[10px] font-bold uppercase text-gray-500">Expression</div>
                        <div className="flex-grow border-b border-gray-300 border-dashed bg-blue-50/50 group-hover:bg-blue-50 transition-colors">
                           <input
                            type="text"
                            value={panel.expressionNotes}
                            onChange={(e) => onUpdatePanel(panel.id, 'expressionNotes', e.target.value)}
                            className="w-full h-full bg-transparent outline-none text-xs font-serif p-1 text-black placeholder-gray-300"
                            placeholder="Face..."
                           />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Notes Space */}
            <div className="mt-auto pt-2 border-t border-gray-300">
               <div className="text-[10px] text-gray-400 uppercase">Notes</div>
               <div className="h-8 border-b border-dotted border-gray-300"></div>
            </div>
            
            {/* Page Number Shadow Visual */}
            <div className="absolute -bottom-2 -right-2 w-full h-full bg-black/5 -z-10 rounded-sm"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryboardEditor;