/**
 * server.js
 * Main Entry Point
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const state = require('./gamestate');
const logic = require('./logic');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for dev
        methods: ["GET", "POST"]
    }
});

// Start Game Loop
logic.startGameLoop(io);

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    // --- Auth / Join ---
    socket.on('join_game', ({ username }) => {
        const player = state.addPlayer(socket.id, username);
        socket.emit('player_info', player);
        io.emit('player_list_update', state.getAllPlayers());

        // Send initial world state
        socket.emit('gamestate', {
            spsList: state.spsList,
            markets: state.markets
        });
    });

    // --- SPS Creation ---
    socket.on('create_sps', (data) => {
        // data: { title, description, reward, milestones[], duration }
        const sps = state.createSPS(
            socket.id,
            data.title,
            data.description,
            data.reward,
            data.milestones,
            data.duration
        );
        io.emit('sps_created', sps);
    });

    // --- Trading ---
    socket.on('buy_token', ({ spsId, amount }) => {
        const player = state.getPlayer(socket.id);
        const sps = state.getSPS(spsId);
        if (!player || !sps || sps.status === 'SETTLED') return;

        const cost = sps.token.price * amount;
        if (player.balance >= cost) {
            player.balance -= cost;
            player.inventory[spsId] = (player.inventory[spsId] || 0) + amount;

            // Price Impact (Simple: Buy increases price slightly)
            // sps.token.price += 0.5; 
            // logic.js handles price, but maybe instant impact?
            state.updatePrice(spsId, sps.token.price + (0.1 * amount)); // slippage

            socket.emit('player_info', player);
            io.emit('market_update', { spsId, price: sps.token.price });
        }
    });

    socket.on('sell_token', ({ spsId, amount }) => {
        const player = state.getPlayer(socket.id);
        const sps = state.getSPS(spsId);
        if (!player || !sps || sps.status === 'SETTLED') return;

        const currentQty = player.inventory[spsId] || 0;
        if (currentQty >= amount) {
            const revenue = sps.token.price * amount;
            player.balance += revenue;
            player.inventory[spsId] -= amount;

            // Price Impact
            state.updatePrice(spsId, sps.token.price - (0.1 * amount));

            socket.emit('player_info', player);
            io.emit('market_update', { spsId, price: sps.token.price });
        }
    });

    // --- Doer Actions ---
    socket.on('opt_in_doer', ({ spsId, milestoneId }) => {
        const sps = state.getSPS(spsId);
        if (!sps) return;

        const milestone = sps.milestones.find(m => m.id === milestoneId);
        if (milestone && !milestone.assignedTo) {
            milestone.assignedTo = socket.id;
            io.emit('sps_update', sps);
        }
    });

    socket.on('submit_milestone', ({ spsId, milestoneId }) => {
        // In this simple version, submission -> auto-complete OR validator vote
        // Prompt says: "Milestones auto-resolve after timer OR Majority validator vote"
        // Let's implement: Submission starts a validation timer? 
        // Or simpler for "playable in 60m": Creator validates? Or just auto-pass after 10s?

        // Let's go with: Doer submits -> Validated instantly (for flow) 
        // OR add a "Validator" role.
        // Let's stick to prompt: "Milestones auto-resolve after timer OR Majority validator vote"

        // Implementation: Mark as "REVIEW" -> 10s later -> COMPLETED
        const sps = state.getSPS(spsId);
        const milestone = sps.milestones.find(m => m.id === milestoneId);
        if (milestone && milestone.status === 'PENDING') {
            milestone.status = 'REVIEW';
            io.emit('sps_update', sps);

            // Auto-pass after 5 seconds (simulating validation)
            setTimeout(() => {
                if (milestone.status === 'REVIEW') {
                    milestone.status = 'COMPLETED';

                    // Doer Reward (Partial from pool?)
                    const doer = state.getPlayer(milestone.assignedTo);
                    if (doer) {
                        doer.balance += (sps.rewardPool / sps.milestones.length);
                        doer.reputation += 2;
                        // Update player info
                        io.to(doer.id).emit('player_info', doer);
                    }

                    io.emit('sps_update', sps);
                }
            }, 5000);
        }
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        state.removePlayer(socket.id);
        io.emit('player_list_update', state.getAllPlayers());
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
