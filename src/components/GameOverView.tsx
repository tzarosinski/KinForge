import React, { useEffect, useState } from 'react';

export default function GameOverView() {
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setReason(params.get('reason'));
  }, []);

  const messages: Record<string, { title: string; desc: string }> = {
    'overrun': {
      title: 'The Ramparts Have Fallen',
      desc: 'The orcs overwhelmed the walls. Ironhold burns.',
    },
    'gate-breached': {
      title: 'The Gate is Broken',
      desc: 'The Void Beast shattered the iron bars. The city is lost.',
    },
    'default': {
      title: 'Defeat',
      desc: 'Your journey ends here.',
    }
  };

  const content = messages[reason || 'default'] || messages['default'];

  const handleTryAgain = () => {
    window.history.back();
  };

  const handleReturnToCompendium = () => {
    window.location.href = '/compendium/welcome';
  };

  return (
    <div className="not-prose flex flex-col items-center justify-center p-8 text-center bg-purple-950/30 border border-purple-900/50 rounded-xl my-8">
      <div className="text-6xl mb-4">💀</div>
      <h1 className="text-3xl font-bold text-purple-400 mb-2">{content.title}</h1>
      <p className="text-xl text-purple-200 mb-8">{content.desc}</p>
      
      <div className="flex gap-4 flex-wrap justify-center">
        <button 
          onClick={handleTryAgain}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors cursor-pointer"
        >
          Try Again
        </button>
        
        <button 
          onClick={handleReturnToCompendium}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors cursor-pointer"
        >
          Return to Compendium
        </button>
      </div>
    </div>
  );
}
