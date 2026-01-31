import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';

const GameContext = createContext();

const SOCKET_URL = 'http://localhost:3000';

export const GameProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [player, setPlayer] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [logs, setLogs] = useState([]);

    // Game State
    const [gameState, setGameState] = useState({
        spsList: {},
        markets: {}
    });
    const [allPlayers, setAllPlayers] = useState([]);

    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => setIsConnected(true));
        newSocket.on('disconnect', () => setIsConnected(false));

        newSocket.on('player_info', (p) => setPlayer(p));
        newSocket.on('player_list_update', (list) => setAllPlayers(list));

        newSocket.on('gamestate', (state) => {
            setGameState(prev => ({ ...prev, ...state }));
        });

        newSocket.on('sps_created', (sps) => {
            setGameState(prev => ({
                ...prev,
                spsList: { ...prev.spsList, [sps.id]: sps }
            }));
            setLogs(prev => [`[NEW] ${sps.title} created.`, ...prev].slice(0, 50));
        });

        newSocket.on('sps_update', (sps) => {
            setGameState(prev => {
                // Check for settlement logging
                const old = prev.spsList[sps.id];
                if (old && old.status !== 'SETTLED' && sps.status === 'SETTLED') {
                    setLogs(p => [`[SETTLED] ${sps.title} has finished!`, ...p].slice(0, 50));
                }
                return { ...prev, spsList: { ...prev.spsList, [sps.id]: sps } };
            });
        });

        newSocket.on('market_update', ({ spsId, price }) => {
            setGameState(prev => {
                const newMarkets = { ...prev.markets };
                if (!newMarkets[spsId]) newMarkets[spsId] = { history: [], lastPrice: price };

                // Append history
                newMarkets[spsId].lastPrice = price;
                newMarkets[spsId].history.push({ t: Date.now(), p: price });

                return { ...prev, markets: newMarkets };
            });
        });

        return () => newSocket.close();
    }, []);

    const joinGame = (username) => {
        if (socket) socket.emit('join_game', { username });
    };

    const createSPS = (data) => {
        if (socket) socket.emit('create_sps', data);
    };

    const buyToken = (spsId, amount) => {
        if (socket) socket.emit('buy_token', { spsId, amount: parseInt(amount) });
    };

    const sellToken = (spsId, amount) => {
        if (socket) socket.emit('sell_token', { spsId, amount: parseInt(amount) });
    };

    const optInDoer = (spsId, milestoneId) => {
        if (socket) socket.emit('opt_in_doer', { spsId, milestoneId });
    };

    const submitMilestone = (spsId, milestoneId) => {
        if (socket) socket.emit('submit_milestone', { spsId, milestoneId });
    };

    return (
        <GameContext.Provider value={{
            socket, player, isConnected, gameState, allPlayers, logs,
            joinGame, createSPS, buyToken, sellToken, optInDoer, submitMilestone
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
