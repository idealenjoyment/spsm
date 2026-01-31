import React from 'react';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';

export default function Lobby() {
    const { allPlayers, gameState } = useGame();
    const navigate = useNavigate();

    const activeSPSCount = Object.values(gameState.spsList).filter(s => s.status !== 'SETTLED').length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Menu */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h2 className="text-xl font-bold mb-4">Game Menu</h2>
                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/market')}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 p-4 rounded-lg font-bold hover:brightness-110 flex justify-between items-center"
                    >
                        <span>Enter Market</span>
                        <span className="bg-black/30 px-2 py-1 rounded text-sm">{activeSPSCount} Active SPS</span>
                    </button>

                    <div className="p-4 bg-gray-700/50 rounded-lg text-sm text-gray-400">
                        <p className="mb-2"><strong>Goal:</strong> Accumulate the most points (Balance + Reputation).</p>
                        <p>1. <strong>Create</strong> problem statements (SPS).</p>
                        <p>2. <strong>Speculate</strong> on tokens (Buy Low, Sell High).</p>
                        <p>3. <strong>Solve</strong> milestones as a Doer.</p>
                    </div>
                </div>
            </div>

            {/* Online Players */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h2 className="text-xl font-bold mb-4">Online Players ({allPlayers.length})</h2>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {allPlayers.map(p => (
                        <div key={p.id} className="flex justify-between items-center bg-gray-700/50 p-3 rounded">
                            <span className="font-semibold">{p.username}</span>
                            <div className="flex gap-3 text-sm">
                                <span className="text-green-400">${p.balance.toFixed(0)}</span>
                                <span className="text-purple-400">Rep: {p.reputation}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
