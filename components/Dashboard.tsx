import React from 'react';

export const Dashboard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center text-slate-900 font-bold">F</div>
               <span className="font-bold tracking-tight text-white">FORENSIC AUDITOR</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#" className="bg-slate-900 text-white px-3 py-2 rounded-md text-sm font-medium border border-slate-700">Investigations</a>
                <a href="#" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">History</a>
                <a href="#" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Network Map</a>
                <a href="#" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Settings</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-slate-400 font-mono">SYSTEM ONLINE</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

    </div>
  );
};
