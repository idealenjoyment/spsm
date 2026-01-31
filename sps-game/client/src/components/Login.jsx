import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function Login() {
    const { joinGame } = useGame();
    const [username, setUsername] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username.trim()) joinGame(username);
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gray-900">
            <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700 w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Enter the Simulation</h2>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Display Name"
                    className="w-full bg-gray-700 text-white p-3 rounded mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                    autoFocus
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-bold transition-colors"
                >
                    Join Game
                </button>
            </form>
        </div>
    );
}
