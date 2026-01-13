import React, { useState, useCallback } from 'react';
import { StoryboardPanel, ParsingStatus } from './types';
import { parseScriptToStoryboard } from './services/geminiService';
import InputPanel from './components/InputPanel';
import StoryboardEditor from './components/StoryboardEditor';
import PrintLayout from './components/PrintLayout';

const App: React.FC = () => {
  const [panels, setPanels] = useState<StoryboardPanel[]>([]);
  const [status, setStatus] = useState<ParsingStatus>({ isLoading: false, error: null, progress: 0 });
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleProcessScript = async (script: string) => {
    setStatus({ isLoading: true, error: null, progress: 10 });
    try {
      const generatedPanels = await parseScriptToStoryboard(script);
      setPanels(generatedPanels);
      setHasGenerated(true);
      setStatus({ isLoading: false, error: null, progress: 100 });
    } catch (err: any) {
      setStatus({ isLoading: false, error: err.message || "Unknown error", progress: 0 });
    }
  };

  const handleUpdatePanel = useCallback((id: string, field: keyof StoryboardPanel, value: string) => {
    setPanels(prev => prev.map(panel => 
      panel.id === id ? { ...panel, [field]: value } : panel
    ));
  }, []);

  const handleSavePDF = () => {
    // 1. Set saving state to true. This triggers the render update below,
    //    moving the PrintLayout from off-screen to on-screen (z-index top).
    setIsSaving(true);
    
    // 2. Wait for the DOM to update so the element is visible for html2pdf
    setTimeout(() => {
      const element = document.getElementById('print-root');
      if (!element) {
        console.error("Print element not found");
        setIsSaving(false);
        return;
      }

      // @ts-ignore
      const html2pdf = window.html2pdf;

      if (!html2pdf) {
        alert("PDF library not loaded. Please check your internet connection.");
        setIsSaving(false);
        return;
      }

      const opt = {
        margin: 0,
        filename: `storyboard-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollX: 0, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          setIsSaving(false);
        })
        .catch((err: any) => {
          console.error("PDF generation failed:", err);
          alert("Failed to generate PDF.");
          setIsSaving(false);
        });
    }, 100); // 100ms delay to ensure layout paint
  };

  const handleReset = () => {
    setHasGenerated(false);
    setPanels([]);
    setStatus({ isLoading: false, error: null, progress: 0 });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col overflow-x-hidden">
      {/* 
        Print Layout Container 
        - When NOT saving: Fixed off-screen to the right (left-[200vw]). This prevents occlusion/blank capture issues while keeping it out of view.
        - When SAVING: Fixed top-left (left-0 top-0) with high z-index. This overlays the screen momentarily, ensuring html2canvas sees it perfectly.
      */}
      <PrintLayout 
        panels={panels} 
        className={`fixed top-0 transition-opacity duration-0 
          ${isSaving ? 'left-0 z-[9999] opacity-100 pointer-events-none' : 'left-[200vw] opacity-0'}
        `}
      />

      {/* Screen Only UI */}
      <div className="flex-grow flex flex-col relative z-10"> 
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h1 className="text-xl font-bold tracking-tight">Script2Story</h1>
            </div>
            <div className="text-sm text-slate-400">
              {process.env.API_KEY ? (
                <span className="flex items-center gap-2 text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Gemini AI Active
                </span>
              ) : (
                <span className="flex items-center gap-2 text-red-400">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  API Key Missing
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8">
          {!hasGenerated ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in-up">
              <div className="text-center space-y-4 max-w-2xl">
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Transform Scripts to Storyboards
                </h2>
                <p className="text-lg text-slate-400">
                  Paste your raw script below. Our AI identifies scenes, actions, and mood, creating a professional A4 storyboard template ready for your sketches.
                </p>
              </div>
              
              <InputPanel onProcess={handleProcessScript} status={status} />
            </div>
          ) : (
            <div className="animate-fade-in w-full flex justify-center">
              <StoryboardEditor 
                panels={panels}
                onUpdatePanel={handleUpdatePanel}
                onSavePDF={handleSavePDF}
                onReset={handleReset}
                isSaving={isSaving}
              />
            </div>
          )}
        </main>
      </div>
      
    </div>
  );
};

export default App;