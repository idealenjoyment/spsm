import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';

export default function SPSDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { gameState, player, buyToken, sellToken, optInDoer, submitMilestone } = useGame();

    const sps = gameState.spsList[id];
    const market = gameState.markets[id];

    const [tradeAmount, setTradeAmount] = useState(1);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!sps) return;
        const timer = setInterval(() => {
            const left = Math.max(0, Math.floor((sps.deadline - Date.now()) / 1000));
            setTimeLeft(left);
            if (left === 0 && sps.status === 'SETTLED') {
                // Maybe redirect or show settled status?
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [sps]);

    if (!sps) return <div className="p-8">SPS Not Found</div>;

    const myTokens = player.inventory[sps.id] || 0;
    const priceHistory = market ? market.history : [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column: Info & Market */}
            <div className="lg:col-span-2 space-y-6">

                {/* Header */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{sps.title}</h1>
                            <p className="text-gray-400">{sps.description}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-mono font-bold text-green-400">${sps.token.price.toFixed(2)}</div>
                            <div className="text-red-400 font-mono">⏳ {timeLeft}s</div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="h-48 mt-6 bg-gray-900/50 rounded p-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={priceHistory}>
                                <YAxis domain={['auto', 'auto']} hide />
                                <Line type="monotone" dataKey="p" stroke="#4ade80" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Trading Interface */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-xl font-bold mb-4">Trade Tokens</h3>
                    <div className="flex gap-4 items-center mb-4">
                        <button
                            onClick={() => setTradeAmount(Math.max(1, tradeAmount - 1))}
                            className="bg-gray-700 px-3 py-1 rounded"
                        >-</button>
                        <input
                            type="number"
                            value={tradeAmount}
                            onChange={(e) => setTradeAmount(parseInt(e.target.value) || 1)}
                            className="bg-black/30 w-20 text-center p-2 rounded"
                        />
                        <button
                            onClick={() => setTradeAmount(tradeAmount + 1)}
                            className="bg-gray-700 px-3 py-1 rounded"
                        >+</button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => buyToken(sps.id, tradeAmount)}
                            className="bg-green-600 hover:bg-green-500 py-3 rounded font-bold"
                        >
                            BUY (Cost: ${(sps.token.price * tradeAmount).toFixed(0)})
                        </button>
                        <button
                            onClick={() => sellToken(sps.id, tradeAmount)}
                            disabled={myTokens < tradeAmount}
                            className="bg-red-600 hover:bg-red-500 py-3 rounded font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            SELL (Value: ${(sps.token.price * tradeAmount).toFixed(0)})
                        </button>
                    </div>
                    <div className="mt-2 text-center text-sm text-gray-400">
                        You own: {myTokens} tokens
                    </div>
                </div>
            </div>

            {/* Right Column: Milestones & Doer Actions */}
            <div className="space-y-6">
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-xl font-bold mb-4">Milestones</h3>
                    <div className="space-y-3">
                        {sps.milestones.map((m, idx) => (
                            <div key={idx} className={`p-3 rounded border ${m.status === 'COMPLETED' ? 'bg-green-900/20 border-green-800' :
                                    m.status === 'REVIEW' ? 'bg-yellow-900/20 border-yellow-800' :
                                        'bg-gray-700/30 border-gray-600'
                                }`}>
                                <div className="flex justify-between mb-2">
                                    <span className={`text-sm font-bold ${m.status === 'COMPLETED' ? 'text-green-400 line-through' : 'text-gray-200'
                                        }`}>
                                        {m.desc}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded bg-black/50 h-fit">
                                        {m.status}
                                    </span>
                                </div>

                                {/* Action Button */}
                                {m.status === 'PENDING' && (
                                    !m.assignedTo ? (
                                        <button
                                            onClick={() => optInDoer(sps.id, m.id)}
                                            className="w-full text-xs bg-blue-600 hover:bg-blue-500 py-1 rounded"
                                        >
                                            Claim Task
                                        </button>
                                    ) : (
                                        m.assignedTo === player.id ? (
                                            <button
                                                onClick={() => submitMilestone(sps.id, m.id)}
                                                className="w-full text-xs bg-yellow-600 hover:bg-yellow-500 py-1 rounded text-black font-bold"
                                            >
                                                Submit Work
                                            </button>
                                        ) : (
                                            <div className="text-xs text-center text-gray-500 italic">
                                                Assigned to another Doer
                                            </div>
                                        )
                                    )
                                )}
                                {m.status === 'REVIEW' && (
                                    <div className="text-xs text-center text-yellow-400 animate-pulse">
                                        Validating...
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Settlement Info (Only visible if settled) */}
                {sps.status === 'SETTLED' && (
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h3 className="text-xl font-bold mb-2">Outcome</h3>
                        <div className="text-center p-4 bg-black/20 rounded">
                            {sps.milestones.every(m => m.status === 'COMPLETED') ? (
                                <span className="text-green-400 font-bold text-xl">SUCCESS (100)</span>
                            ) : (
                                <span className="text-red-400 font-bold text-xl">FAILURE (0)</span>
                            )}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
