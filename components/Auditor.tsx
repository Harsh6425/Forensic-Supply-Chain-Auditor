import React, { useState, useCallback } from 'react';
import { FileData, InvestigationReport } from '../types';
import { analyzeEvidence } from '../services/geminiService';
import { ReportView } from './ReportView';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit for demo

export const Auditor: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [notes, setNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<InvestigationReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>, type: FileData['type']) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      if (file.size > MAX_FILE_SIZE) {
        setError(`File ${file.name} is too large. Max 10MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setFiles(prev => {
            const filtered = prev.filter(f => f.type !== type); // Replace existing type if any
            return [...filtered, { file, type, base64, mimeType: file.type }];
        });
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError("Please upload at least one piece of evidence.");
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeEvidence(files, notes);
      setReport(result);
    } catch (err) {
      setError("Investigation failed. Please try again or check your API key.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setNotes('');
    setReport(null);
    setError(null);
  };

  if (report) {
    return <ReportView report={report} onReset={reset} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-5xl mx-auto">
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tighter">FORENSIC SUPPLY CHAIN AUDITOR</h1>
        <p className="text-slate-400">Autonomous Cross-Modal Discrepancy Detection</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
        {/* Video Input */}
        <div className={`p-6 rounded-xl border-2 border-dashed transition-all ${files.find(f => f.type === 'video') ? 'border-cyan-500 bg-cyan-900/10' : 'border-slate-700 bg-slate-800/30 hover:border-slate-500'}`}>
            <label className="cursor-pointer flex flex-col items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${files.find(f => f.type === 'video') ? 'bg-cyan-500 text-black' : 'bg-slate-700 text-slate-400'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </div>
                <div className="text-center">
                    <span className="block font-bold text-slate-200">CCTV Footage</span>
                    <span className="text-xs text-slate-500">{files.find(f => f.type === 'video')?.file.name || "Upload .mp4, .webm"}</span>
                </div>
                <input type="file" accept="video/*" onChange={(e) => handleFileChange(e, 'video')} className="hidden" />
            </label>
        </div>

        {/* Audio Input */}
        <div className={`p-6 rounded-xl border-2 border-dashed transition-all ${files.find(f => f.type === 'audio') ? 'border-emerald-500 bg-emerald-900/10' : 'border-slate-700 bg-slate-800/30 hover:border-slate-500'}`}>
            <label className="cursor-pointer flex flex-col items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${files.find(f => f.type === 'audio') ? 'bg-emerald-500 text-black' : 'bg-slate-700 text-slate-400'}`}>
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </div>
                <div className="text-center">
                    <span className="block font-bold text-slate-200">Driver Voice Log</span>
                    <span className="text-xs text-slate-500">{files.find(f => f.type === 'audio')?.file.name || "Upload .mp3, .wav"}</span>
                </div>
                <input type="file" accept="audio/*" onChange={(e) => handleFileChange(e, 'audio')} className="hidden" />
            </label>
        </div>

        {/* Document Input */}
        <div className={`p-6 rounded-xl border-2 border-dashed transition-all ${files.find(f => f.type === 'document') ? 'border-indigo-500 bg-indigo-900/10' : 'border-slate-700 bg-slate-800/30 hover:border-slate-500'}`}>
            <label className="cursor-pointer flex flex-col items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${files.find(f => f.type === 'document') ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div className="text-center">
                    <span className="block font-bold text-slate-200">Manifest / PDF</span>
                    <span className="text-xs text-slate-500">{files.find(f => f.type === 'document')?.file.name || "Upload .pdf, .jpg"}</span>
                </div>
                <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'document')} className="hidden" />
            </label>
        </div>
      </div>

      <div className="w-full mb-8">
        <textarea
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-4 text-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-slate-600"
            rows={3}
            placeholder="Add contextual notes about this shipment (e.g., 'Truck ID 4452 from Warehouse B, Driver claims delay due to traffic...')"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing || files.length === 0}
        className={`relative group px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-bold text-white shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden w-full md:w-auto min-w-[300px]`}
      >
         <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
         <span className="relative flex items-center justify-center gap-2">
            {isAnalyzing ? (
                <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    RUNNING FORENSIC ANALYSIS...
                </>
            ) : (
                <>INITIATE INVESTIGATION PROTOCOL</>
            )}
         </span>
      </button>

      <div className="mt-8 text-xs text-slate-500 max-w-2xl text-center">
        <p>SYSTEM SECURED: GEMINI-3-PRO-PREVIEW ACTIVATED.</p>
        <p>This tool processes data client-side where possible. Large files may take time to encode.</p>
      </div>

    </div>
  );
};
