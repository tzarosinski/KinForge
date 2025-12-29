import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { $party, setParty } from '../store';
import { UserPlus, Play, X, Users } from 'lucide-react';

export default function PartySetup() {
  const party = useStore($party);
  const [isOpen, setIsOpen] = useState(party.length === 0);
  const [members, setMembers] = useState(
    party.length > 0 ? party : [{ name: '', avatar: '🛡️' }]
  );

  if (!isOpen && party.length > 0) return null;

  const addMember = () => {
    setMembers([...members, { name: '', avatar: '⚔️' }]);
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: 'name' | 'avatar', value: string) => {
    const newMembers = [...members];
    // @ts-ignore
    newMembers[index] = { ...newMembers[index], [field]: value };
    setMembers(newMembers);
  };

  const handleStart = () => {
    const validMembers = members.filter(m => m.name.trim() !== '');
    if (validMembers.length === 0) return;
    setParty(validMembers);
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-slate-900 border-2 border-forge-gold rounded-xl p-6 shadow-2xl relative">
        {party.length > 0 && (
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-slate-500 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-forge-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-forge-gold/30">
            <Users className="w-8 h-8 text-forge-gold" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Muster the Party</h2>
          <p className="text-slate-400 text-sm">
            Who is adventuring today? We'll shuffle them into the turn order.
          </p>
        </div>

        <div className="space-y-3 mb-6 max-h-[40vh] overflow-y-auto pr-2">
          {members.map((member, index) => (
            <div key={index} className="flex gap-2 animate-in slide-in-from-left-4 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="relative w-14 shrink-0">
                <input
                  type="text"
                  value={member.avatar}
                  onChange={(e) => updateMember(index, 'avatar', e.target.value)}
                  className="w-full h-12 text-center text-2xl bg-slate-800 border border-slate-700 rounded-lg focus:border-forge-blue focus:outline-none focus:ring-1 focus:ring-forge-blue"
                  placeholder="😀"
                />
              </div>
              <input
                type="text"
                value={member.name}
                onChange={(e) => updateMember(index, 'name', e.target.value)}
                placeholder={`Hero Name...`}
                className="flex-1 px-4 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-forge-blue focus:outline-none focus:ring-1 focus:ring-forge-blue"
              />
              {members.length > 1 && (
                <button
                  onClick={() => removeMember(index)}
                  className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={addMember}
            className="flex-1 py-3 border-2 border-dashed border-slate-700 text-slate-400 rounded-lg hover:border-slate-500 hover:text-white transition-all flex items-center justify-center gap-2 font-semibold hover:bg-slate-800"
          >
            <UserPlus className="w-5 h-5" />
            Add Hero
          </button>
          <button
            onClick={handleStart}
            className="flex-[2] py-3 bg-forge-gold text-forge-dark rounded-lg font-bold hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 active:scale-95"
          >
            <Play className="w-5 h-5 fill-current" />
            Start Adventure
          </button>
        </div>
      </div>
    </div>
  );
}