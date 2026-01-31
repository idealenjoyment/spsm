/**
 * logic.js
 * Game Rules and Calculations
 */
const state = require('./gamestate');

const LOOP_INTERVAL = 1000; // 1 second tick

// --- Price Formula ---
function calculatePrice(sps) {
    // Factors:
    // 1. Time Remaining (Pressure): Values drops as deadline approaches if not complete?
    //    Or maybe increases if it looks likely?
    //    Let's say: Base + (CompletedMilestones * 20) - (TimeElapsed * 0.1)
    //    Wait, prompt said: "Price updates based on: Time remaining, Milestones passed, Doer reputation"

    const now = Date.now();
    const timeLeft = Math.max(0, sps.deadline - now) / 1000; // seconds
    const totalDuration = (sps.deadline - sps.createdAt) / 1000;
    const timeProgress = 1 - (timeLeft / totalDuration); // 0 to 1

    const passedMilestones = sps.milestones.filter(m => m.status === 'COMPLETED').length;
    const totalMilestones = sps.milestones.length;

    // Calculate average doer reputation working on this
    let totalRep = 0;
    let doerCount = 0;
    sps.milestones.forEach(m => {
        if (m.assignedTo) {
            const doer = state.getPlayer(m.assignedTo);
            if (doer) {
                totalRep += doer.reputation;
                doerCount++;
            }
        }
    });
    const avgRep = doerCount > 0 ? totalRep / doerCount : 0;

    // Formula
    // Base: 10
    // Milestone Bonus: +25 per milestone
    // Reputation Bonus: +0.5 per avg rep point
    // Time Decay: If no progress, price decays? 
    // Let's make it simpler:
    // Price = 10 + (25 * passedMilestones) + (avgRep * 2) + (randomVolatility)

    let price = 10 + (25 * passedMilestones) + (avgRep * 1.5);

    // Time Crunch: If near deadline and not finished, panic sell (price drops)
    if (timeLeft < 60 && passedMilestones < totalMilestones) {
        price = price * 0.5;
    }

    // Volatility / Noise
    // const noise = (Math.random() - 0.5) * 2; // +/- 1
    // price += noise;

    return parseFloat(price.toFixed(2));
}

// --- Settlement ---
function settleSPS(spsId) {
    const sps = state.getSPS(spsId);
    if (!sps || sps.status === 'SETTLED') return;

    const allPassed = sps.milestones.every(m => m.status === 'COMPLETED');
    const finalValue = allPassed ? 100 : 0; // Binary outcome: Success = 100, Fail = 0

    // Settle Tokens for all players
    const players = state.getAllPlayers();
    players.forEach(p => {
        const qty = p.inventory[spsId] || 0;
        if (qty > 0) {
            const payout = qty * finalValue;
            p.balance += payout;

            // Reputation Effect from Speculation
            if (payout > 0 && finalValue === 100) {
                p.reputation += 1; // Good bet
            } else if (qty > 5 && finalValue === 0) {
                p.reputation -= 1; // Bad bet
            }

            delete p.inventory[spsId];
        }
    });

    sps.status = 'SETTLED';
    state.updatePrice(spsId, finalValue);

    // Creator Rep Update
    const creator = state.getPlayer(sps.creatorId);
    if (creator) {
        if (allPassed) creator.reputation += 5;
        else creator.reputation -= 3;
    }
}

// --- Game Loop ---
function startGameLoop(io) {
    setInterval(() => {
        const allSPS = state.getAllSPS();

        allSPS.forEach(sps => {
            if (sps.status === 'SETTLED') return;

            // Check Deadline
            if (Date.now() > sps.deadline) {
                // Time up!
                // If all milestones done?
                const allDone = sps.milestones.every(m => m.status === 'COMPLETED');
                if (allDone) {
                    // Success already handled if milestones update triggering settlement? 
                    // Or we just settle here.
                    settleSPS(sps.id);
                } else {
                    // Failure
                    settleSPS(sps.id);
                }
            } else {
                // Update Price
                const newPrice = calculatePrice(sps);
                state.updatePrice(sps.id, newPrice);
            }
        });

        // Broadcast State (Optimization: diffs only?)
        // For this game, full state every second or boolean "needsUpdate" is fine
        io.emit('gamestate', {
            spsList: state.spsList,
            markets: state.markets,
            timestamp: Date.now()
        });

    }, LOOP_INTERVAL);
}

module.exports = {
    startGameLoop,
    settleSPS,
    calculatePrice
};
