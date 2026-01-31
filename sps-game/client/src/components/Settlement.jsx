import React from 'react';
import { useGame } from '../context/GameContext';

export default function Settlement() {
    const { allPlayers, gameState } = useGame();

    // Sort players by total wealth (Balance + Realized Gains? Just Balance + Rep for now)
    // Wealth = Balance + Value of Inventory?
    // Let's stick to prompt: "Show winners / losers, Token P&L, Reputation"

    const sortedPlayers = [...allPlayers].sort((a, b) => b.balance - a.balance);
    const settledSPS = Object.values(gameState.spsList).filter(s => s.status === 'SETTLED');

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold mb-6">Settlement & Leaderboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Leaderboard */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-xl font-bold mb-4">Rich List</h3>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-700 text-gray-400">
                                <th className="pb-2">Player</th>
                                <th className="pb-2 text-right">Balance</th>
                                <th className="pb-2 text-right">Reputation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedPlayers.map((p, idx) => (
                                <tr key={p.id} className="border-b border-gray-700/50">
                                    <td className="py-2 font-bold">
                                        {idx === 0 && '👑 '}
                                        {p.username}
                                    </td>
                                    <td className="py-2 text-right font-mono text-green-400">${p.balance.toFixed(0)}</td>
                                    <td className="py-2 text-right font-mono text-purple-400">{p.reputation}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Recent Settlements */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-xl font-bold mb-4">Past Operations</h3>
                    <div className="space-y-4">
                        {settledSPS.length === 0 && <p className="text-gray-500">No settled operations yet.</p>}
                        {settledSPS.map(sps => (
                            <div key={sps.id} className="bg-black/20 p-3 rounded">
                                <div className="flex justify-between">
                                    <span className="font-bold">{sps.title}</span>
                                    <span className={sps.milestones.every(m => m.status === 'COMPLETED') ? 'text-green-500' : 'text-red-500'}>
                                        {sps.milestones.every(m => m.status === 'COMPLETED') ? 'SUCCESS' : 'FAILED'}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Final Price: ${sps.token.price}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
