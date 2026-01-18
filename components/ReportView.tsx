import React from 'react';
import { InvestigationReport, Discrepancy } from '../types';
import { TimelineChart, NetworkGraph } from './Visuals';

interface ReportViewProps {
  report: InvestigationReport;
  onReset: () => void;
}

const DiscrepancyCard: React.FC<{ item: Discrepancy }> = ({ item }) => {
  const colors = {
    TEMPORAL_MISMATCH: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    QUANTITY_VARIANCE: 'bg-red-500/10 text-red-500 border-red-500/20',
    VERBAL_CONTRADICTION: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    BEHAVIORAL_ANOMALY: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  };

  const riskColor = item.risk_score >= 8 ? 'text-red-500' : item.risk_score >= 5 ? 'text-amber-500' : 'text-green-500';

  return (
    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 mb-4 hover:border-slate-600 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <span className={`px-2 py-1 rounded text-xs font-bold border ${colors[item.type]}`}>
          {item.type.replace('_', ' ')}
        </span>
        <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">CONFIDENCE: <span className="text-white">{item.confidence}</span></span>
            <span className="text-xs text-slate-400">RISK: <span className={`font-bold ${riskColor}`}>{item.risk_score}/10</span></span>
        </div>
      </div>
      <p className="text-slate-300 text-sm mb-3">{item.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs bg-slate-900/50 p-2 rounded">
        {item.evidence.video && (
             <div className="border-l-2 border-cyan-500 pl-2">
                <span className="block text-cyan-500 font-bold mb-1">VIDEO EVIDENCE</span>
                <span className="block text-slate-400">{item.evidence.video.timestamp}</span>
                <span className="text-slate-500 italic">"{item.evidence.video.observation}"</span>
             </div>
        )}
        {item.evidence.audio && (
             <div className="border-l-2 border-emerald-500 pl-2">
                <span className="block text-emerald-500 font-bold mb-1">AUDIO LOG</span>
                <span className="block text-slate-400">{item.evidence.audio.timestamp}</span>
                <span className="text-slate-500 italic">"{item.evidence.audio.transcription}"</span>
             </div>
        )}
        {item.evidence.document && (
             <div className="border-l-2 border-indigo-500 pl-2">
                <span className="block text-indigo-500 font-bold mb-1">DOCUMENT</span>
                <span className="block text-slate-400">ID: {item.evidence.document.manifest_id}</span>
                <span className="text-slate-500 italic">{item.evidence.document.field}</span>
             </div>
        )}
      </div>
    </div>
  );
};

export const ReportView: React.FC<ReportViewProps> = ({ report, onReset }) => {
  return (
    <div className="flex flex-col h-full animate-fade-in text-slate-200">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6 border-b border-slate-700 pb-4">
        <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="text-cyan-400">CASE FILE:</span> 
                {report.investigation_id}
            </h1>
            <p className="text-slate-400 mt-1 max-w-2xl">{report.summary}</p>
        </div>
        <div className="text-right">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Estimated Shrinkage</div>
            <div className="text-3xl font-mono text-red-500 font-bold">{report.shrinkage_estimate_usd}</div>
            <button 
                onClick={onReset}
                className="mt-4 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded border border-slate-600 transition-colors"
            >
                START NEW INVESTIGATION
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow overflow-auto pb-8">
        
        {/* Left Column: Discrepancies */}
        <div className="lg:col-span-2 space-y-6">
            <div>
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-l-4 border-cyan-500 pl-3">Identified Discrepancies</h2>
                <div className="space-y-4">
                    {report.discrepancies_found.map((disc, idx) => (
                        <DiscrepancyCard key={idx} item={disc} />
                    ))}
                </div>
            </div>

            <div className="mt-8">
                <TimelineChart discrepancies={report.discrepancies_found} />
            </div>
        </div>

        {/* Right Column: People & Actions */}
        <div className="space-y-6">
            
            <div className="bg-slate-800/30 rounded-lg p-1 border border-slate-700/50">
               <NetworkGraph persons={report.persons_of_interest} />
            </div>

            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-l-4 border-indigo-500 pl-3">Persons of Interest</h2>
                <ul className="space-y-3">
                    {report.persons_of_interest.map((person, idx) => (
                        <li key={idx} className="flex justify-between items-center bg-slate-900/50 p-2 rounded">
                            <div>
                                <span className="block font-bold text-white">{person.name}</span>
                                <span className="text-xs text-slate-500">{person.role}</span>
                            </div>
                            <div className="text-right">
                                <span className="block text-xs text-red-400">{person.flag_count} Flags</span>
                                <span className="text-[10px] text-slate-600 uppercase">{person.relation_to_incident}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

             <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-l-4 border-emerald-500 pl-3">Recommended Actions</h2>
                <ul className="space-y-2">
                    {report.recommended_actions.map((action, idx) => (
                        <li key={idx} className="flex gap-2 items-start text-sm text-slate-300">
                            <span className="text-emerald-500 mt-1">✓</span>
                            {action}
                        </li>
                    ))}
                </ul>
            </div>

        </div>

      </div>
    </div>
  );
};
