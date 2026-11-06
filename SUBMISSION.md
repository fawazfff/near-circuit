# NEAR Hackathon 2026 - Submission Document

**Project Name:** NEAR Circuit: Underground Economy  
**Track:** 09 - Games With Real Economies (`id: games`)  
**Tagline:** Build NPCs with wallets, player-owned markets and economies that evolve without a dev patch.  
**Repository:** [https://github.com/fawazfff/near-circuit](https://github.com/fawazfff/near-circuit)  

---

## 1. Executive Summary & The Problem

Most Web3 games suffer from two fatal flaws:
1. **Broken Game Loop (Friction):** Every item transfer or action triggers a popup from MetaMask or a wallet extension, destroying real-time gameplay flow.
2. **Artificial Economies:** Game shops are static database rows with infinite items, fixed prices, and zero economic consequence. Devs constantly have to balance patches manually.

**NEAR Circuit solves both by making NEAR's native primitives the heart of the game:**
* **Instant Ignition via Session Keys (FastAuth):** Zero seed phrases, zero signing modals, and zero gas popups during high-speed drifts.
* **Autonomous Agent Garages:** Pit crews and mechanics (Marcus, Elena, Dex) hold their own NEAR wallets, run transparent bonding curve algorithms, pay daily paddock bay overhead, and **can go bankrupt** if racers boycott their prices.
* **NEP-245 Multi-Token Standard:** One unified smart contract holds your vehicles, NOS canisters, racing slicks, and garage equity tokens.

---

## 2. Core Game Loop Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CORE ECONOMIC GAME LOOP                         │
├────────────────────────────────────────────────────────────────────────┤
│ 30 SECONDS (The Core Action Loop):                                     │
│  - Launch 4.5 km sprint circuit in the browser canvas.                 │
│  - Dodge rival traffic, drift tight turns, hit NOS rockets.            │
│  - Collect on-track NEAR Shards; cross finish line for purse payout.   │
│  - All rewards and item durability executed with 0 popups via          │
│    Session Key pre-authorized allowances.                              │
├────────────────────────────────────────────────────────────────────────┤
│ 5 MINUTES (The Paddock & Merchant Loop):                               │
│  - Visit 3 autonomous paddock garages with dynamic inventories.        │
│  - Inspect the transparent Reasoning Tooltip to understand *why*        │
│    merchants adjusted prices based on inventory scarcity and demand.   │
│  - Rescue bankrupt mechanics by injecting 25 NEAR bailout capital      │
│    to acquire equity shares and collect automated passive dividends!   │
├────────────────────────────────────────────────────────────────────────┤
│ THE DEMO MOMENT (The 100x Speed Fast-Forward):                         │
│  - Click "Fast-Forward 7 Days" to watch hundreds of simulated street    │
│    races, tire burn, fuel consumption, and market price equilibrium     │
│    evolve live in 30 seconds without any developer intervention.       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. How Track 09 Requirements Are Met

1. **Items are NEP-245 Multi-Tokens:**
   - Implemented in [`src/contracts/nep245.ts`](file:///C:/Users/fawaz/Desktop/GAME/src/contracts/nep245.ts) and on-chain Rust contract in [`contracts/nep245/src/lib.rs`](file:///C:/Users/fawaz/Desktop/GAME/contracts/nep245/src/lib.rs).
   - Manages consumables (`item_nos`, `item_slicks`), permanent equipment (`item_turbo`), and equity shares (`share_marcus`, etc.) in a single contract.

2. **Zero Seed Phrases & Zero Gas Prompts in Normal Game Loop:**
   - Ephemeral session keys are created instantly in browser memory with designated function-call allowances, allowing 60 FPS drift action without signing interruptions.

3. **Merchant Pricing Rules in ONE Readable File:**
   - Fully contained in [`src/economy/pricingEngine.ts`](file:///C:/Users/fawaz/Desktop/GAME/src/economy/pricingEngine.ts). Clean bonding curves, inventory multipliers, overhead deductions, and bankruptcy triggers.

4. **Merchant Reasoning Shown in Tooltips:**
   - Every mechanic card features an expandable, glassmorphic reasoning breakdown displaying inventory ratios, demand factors, cash reserve status, and plain-English rationale for price hikes or discounts.

5. **Fast-Forward Mode (Simulate 1 Week in 1 Minute):**
   - Built-in 7-day simulator running autonomous race cycles, shop revenues, rent deductions, and market shifts at 100x speed.

---

## 4. 2-Minute Demo Video Walkthrough Script

* **[0:00 - 0:30] The Hook & Racing Canvas:**
  *"Welcome to NEAR Circuit. Let's hit the gas on our 4.5 km sprint circuit. Notice how responsive the car handles—we drift, we weave through rival cyber cars, collect on-road NEAR Shards, and fire our NOS rockets. We cross the finish line, earn our race purse, and equip upgrades with ZERO wallet popups thanks to NEAR Session Keys."*
* **[0:30 - 1:15] The Autonomous Paddock Economy:**
  *"Now let's head to the Paddock. These aren't static shops. Marcus, Elena, and Dex each have real NEAR accounts. Look at Marcus's reasoning card: because racers flooded the track buying NOS, his inventory dropped to 20%, triggering a 25% surge price according to our readable bonding curve in `pricingEngine.ts`."*
* **[1:15 - 1:45] Bankruptcy & Bailout Equity:**
  *"If Dex sets his turbo prices too high, racers stop buying. His wallet balance drops below his daily rent, and his garage goes bankrupt! As a player, I can step in, invest 25 NEAR to bail him out, and gain 15% equity, earning passive dividends on all future turbo sales."*
* **[1:45 - 2:00] 7-Day Fast-Forward & Closing:**
  *"Let's click Fast-Forward 7 Days. Watch our live chart: 100+ races simulate, prices find equilibrium, and the economy evolves without any developer patch. That's a real economy on NEAR Protocol."*
