/**
 * gamestate.js
 * Central In-Memory Store for the SPS Game
 */

class GameState {
    constructor() {
      this.players = {}; // map[socketId] -> { id, username, balance, reputation, inventory: { spsId: amount } }
      this.spsList = {}; // map[spsId] -> SPS Object
      this.markets = {}; // map[spsId] -> { history: [], lastPrice: number }
      
      // Global settings
      this.config = {
        initialBalance: 1000,
        initialReputation: 10,
        baseSpsPrice: 10,
      };
    }
  
    // --- Player Management ---
    addPlayer(id, username) {
      this.players[id] = {
        id,
        username: username || `Anon_${id.substr(0,4)}`,
        balance: this.config.initialBalance,
        reputation: this.config.initialReputation,
        inventory: {}, // spsId -> quantity (positive for long, negative for short? Keep simple: long only for now)
        assignedTasks: [] // IDs of milestones
      };
      return this.players[id];
    }
  
    removePlayer(id) {
      // We might want to keep them if they reconnect? For now, simple removal.
      delete this.players[id];
    }
  
    getPlayer(id) {
      return this.players[id];
    }
  
    getAllPlayers() {
      return Object.values(this.players);
    }
  
    // --- SPS Management ---
    createSPS(creatorId, title, description, rewardPool, milestones, deadlineSeconds) {
      const id = Date.now().toString(); // Simple ID
      const sps = {
        id,
        creatorId,
        title,
        description,
        rewardPool: parseInt(rewardPool),
        status: 'OPEN', // OPEN, ACTIVE, SETTLED
        createdAt: Date.now(),
        deadline: Date.now() + (deadlineSeconds * 1000),
        milestones: milestones.map((m, idx) => ({
          id: `${id}_m_${idx}`,
          desc: m,
          status: 'PENDING', // PENDING, COMPLETED, FAILED
          assignedTo: null // player socketId
        })),
        token: {
          supply: 1000,
          price: this.config.baseSpsPrice
        }
      };
  
      this.spsList[id] = sps;
      
      // Initialize Market
      this.markets[id] = {
        history: [{ t: Date.now(), p: sps.token.price }],
        lastPrice: sps.token.price
      };
  
      return sps;
    }
  
    getSPS(id) {
      return this.spsList[id];
    }
  
    getAllSPS() {
      return Object.values(this.spsList);
    }
  
    // --- Token Market ---
    // Simple Automated Market Maker (Constant Product or Linear? Let's go simple Linear/Demand based)
    // Actually, prompt asked for "Price updates based on time, milestones, reputation"
    // So we don't necessarily need a full AMM, we just update price programmatically
    // and let people buy/sell at that price (infinite liquidity from "Bank").
    // Let's treat the System as the Market Maker.
  
    updatePrice(spsId, newPrice) {
      if (!this.spsList[spsId]) return;
      this.spsList[spsId].token.price = Math.max(0.1, newPrice); // Min price
      this.markets[spsId].lastPrice = this.spsList[spsId].token.price;
      this.markets[spsId].history.push({ t: Date.now(), p: this.spsList[spsId].token.price });
    }
  
  }
  
  module.exports = new GameState();
