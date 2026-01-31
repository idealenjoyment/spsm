import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';

export default function Market() {
    const { gameState, createSPS } = useGame();
    const navigate = useNavigate();
    const [showCreate, setShowCreate] = useState(false);

    // Create Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        reward: 1000,
        milestonesStr: '',
        duration: 300 // 5 mins default
    });

    const handleCreate = (e) => {
        e.preventDefault();
        createSPS({
            ...formData,
            milestones: formData.milestonesStr.split('\n').filter(s => s.trim()),
        });
        setShowCreate(false);
    };

    const spsList = Object.values(gameState.spsList).filter(s => s.status !== 'SETTLED');

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Problem Marketplace</h2>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-bold"
                >
                    {showCreate ? 'Cancel' : '+ New SPS'}
                </button>
            </div>

            {showCreate && (
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8 animate-fade-in">
                    <h3 className="text-xl font-bold mb-4">Create New Problem Statement</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Title</label>
                            <input
                                className="w-full bg-gray-700 p-2 rounded text-white"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Description</label>
                            <textarea
                                className="w-full bg-gray-700 p-2 rounded text-white"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Reward Pool (Points)</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-700 p-2 rounded text-white"
                                    value={formData.reward}
                                    onChange={e => setFormData({ ...formData, reward: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Duration (Seconds)</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-700 p-2 rounded text-white"
                                    value={formData.duration}
                                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Milestones (One per line)</label>
                            <textarea
                                className="w-full bg-gray-700 p-2 rounded text-white h-24"
                                value={formData.milestonesStr}
                                onChange={e => setFormData({ ...formData, milestonesStr: e.target.value })}
                                placeholder="Make a plan...&#10;Execute the plan...&#10;Expect the plan to go off the rails..."
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-green-600 hover:bg-green-500 p-3 rounded font-bold">
                            Publish SPS
                        </button>
                    </form>
                </div>
            )}

            {/* Market List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {spsList.map(sps => (
                    <div
                        key={sps.id}
                        onClick={() => navigate(`/sps/${sps.id}`)}
                        className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-blue-500 cursor-pointer transition-all hover:-translate-y-1"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg">{sps.title}</h3>
                            <span className="bg-blue-900 text-blue-300 text-xs px-2 py-1 rounded">
                                ${sps.token.price.toFixed(2)}
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{sps.description}</p>

                        <div className="flex justify-between text-sm text-gray-500">
                            <span>🏆 {sps.rewardPool}</span>
                            <span>⏳ {Math.max(0, Math.floor((sps.deadline - Date.now()) / 1000))}s</span>
                        </div>

                        {/* Mini Sparkline could go here */}
                        <div className="mt-3 h-1 w-full bg-gray-700 rounded overflow-hidden">
                            <div
                                className="h-full bg-green-500"
                                style={{ width: `${(sps.milestones.filter(m => m.status === 'COMPLETED').length / sps.milestones.length) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}

                {spsList.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No active problems. Create one to start the chaos.
                    </div>
                )}
            </div>
        </div>
    );
}
