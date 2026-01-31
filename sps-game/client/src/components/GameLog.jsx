import React from 'react';
import { useGame } from '../context/GameContext';

export default function GameLog() {
    const { logs } = useGame();

    return (
        <div className="fixed bottom-4 right-4 w-80 bg-black/80 backdrop-blur border border-gray-700 rounded-lg p-4 h-64 overflow-y-auto text-xs font-mono shadow-2xl pointer-events-none hover:pointer-events-auto transition-opacity opacity-80 hover:opacity-100">
            <h3 className="font-bold mb-2 text-gray-400 border-b border-gray-700 pb-1">GAME LOG</h3>
            <div className="flex flex-col gap-1">
                {logs.map((log, idx) => (
                    <div key={idx} className="text-gray-300">
                        <span className="text-gray-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                        {log}
                    </div>
                ))}
                {logs.length === 0 && <span className="text-gray-600">No events yet...</span>}
            </div>
        </div>
    );
}
