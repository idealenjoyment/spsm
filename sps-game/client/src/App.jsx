import React from 'react';
import { useGame } from './context/GameContext';
import Login from './components/Login';
import Lobby from './components/Lobby';
import Market from './components/Market';
import SPSDetail from './components/SPSDetail';
import Settlement from './components/Settlement';
import GameLog from './components/GameLog';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';

function App() {
  const { player, isConnected } = useGame();

  if (!isConnected) {
    return <div className="h-screen flex items-center justify-center">Connecting to server...</div>;
  }

  if (!player) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen p-4 max-w-6xl mx-auto pb-64">
        <header className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
          <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 hover:opacity-80">
            SPS Marketplace
          </Link>
          <div className="flex gap-4 items-center">
            <Link to="/market" className="text-gray-300 hover:text-white font-bold">Market</Link>
            <Link to="/settlement" className="text-gray-300 hover:text-white font-bold">Leaderboard</Link>
            <div className="flex gap-2 ml-4">
              <span className="bg-gray-800 px-3 py-1 rounded border border-gray-700">👤 {player.username}</span>
              <span className="bg-green-900/50 px-3 py-1 rounded text-green-300 border border-green-800">💰 {player.balance.toFixed(0)}</span>
              <span className="bg-purple-900/50 px-3 py-1 rounded text-purple-300 border border-purple-800">⭐ {player.reputation}</span>
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/market" element={<Market />} />
          <Route path="/sps/:id" element={<SPSDetail />} />
          <Route path="/settlement" element={<Settlement />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <GameLog />
      </div>
    </BrowserRouter>
  );
}

export default App;
