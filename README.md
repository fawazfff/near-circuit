# NEAR Circuit: Underground Economy
> **Hackathon Track 09: Games With Real Economies** (`id: games`)  
> *Build NPCs with wallets, player-owned markets and economies that evolve without a dev patch.*

---

## 🏎️ The Elevator Pitch
**NEAR Circuit** is an arcade cyber-racing simulator where you race for prize purses on NEAR Shards, but every pit-stop garage and tuner in the paddock is an **autonomous economic agent with their own NEAR wallet, inventory, and dynamic bonding curve**.

Unlike traditional games with infinite static shops:
- If racers hoard NOS before the Grand Prix, nitro prices surge.
- If an NPC garage fails to cover paddock bay overhead rent, **it goes bankrupt and shutters** until a player bails them out for syndicate royalty equity!
- The entire game runs **100% popup-free via Session Keys (FastAuth)** with zero MetaMask interruptions mid-drift.
- All items (cars, nitro, tires, syndicate shares) live on a single **NEP-245 Multi-Token** contract.

---

## 📋 The Game Loop on Paper

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CORE ECONOMIC GAME LOOP                         │
├────────────────────────────────────────────────────────────────────────┤
│ 30 SECONDS (The Action Sprint):                                        │
│  - Launch 4.5 km circuit sprint (W/A/S/D or Arrow Keys, Space for NOS).│
│  - Dodge rival racers, drift corners, collect on-track NEAR Shards.    │
│  - Win the race purse (+3.5 NEAR); consume 1x Tire set and 1x NOS.     │
│  - ZERO wallet popups (Session Key executes state changes in 0.05s).   │
├────────────────────────────────────────────────────────────────────────┤
│ 5 MINUTES (The Paddock Garage & Arbitrage Loop):                       │
│  - Pull into the paddock to inspect 3 autonomous garages:              │
│    • Marcus Vance (Fuel & Nitro Depot)                                 │
│    • Elena Rostova (Track Slicks & Grip Lab)                           │
│    • Dex Kincaid (Ceramic Turbo & ECU Tuning)                          │
│  - Hover over each mechanic to inspect the Transparent Reasoning       │
│    Tooltip (explaining mathematical inventory scarcity & surge fees). │
│  - Spot a struggling mechanic: inject bailout capital to earn passive  │
│    syndicate dividend shares on every future sale!                     │
├────────────────────────────────────────────────────────────────────────┤
│ EVERY SESSION & JUDGE DEMO (The Macro Economy Showcase):               │
│  - Hit the "Fast-Forward 7 Days" button:                               │
│    Judges watch 100+ simulated street races, parts consumption, and    │
│    live dynamic price trends shift in real time without a dev patch.   │
│  - Complete NEAR Academy modules to master Sharding, Intents & FastAuth.│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Verification of Hackathon Track 09 Requirements

| Track Requirement | Implementation in NEAR Circuit | Code Location |
| :--- | :--- | :--- |
| **NEP-245 Multi-Tokens** | One unified contract holds consumables (NOS, tires), upgrades (turbos), and equity shares. | [`src/contracts/nep245.ts`](file:///C:/Users/fawaz/Desktop/GAME/src/contracts/nep245.ts) |
| **Zero Wallet Popups / FastAuth** | Ephemeral browser session key with function call allowance enables 60 FPS drift without signing modals. | [`src/contracts/nep245.ts`](file:///C:/Users/fawaz/Desktop/GAME/src/contracts/nep245.ts) |
| **Pricing Rules in ONE Readable File** | Pure mathematical bonding curve and supply/demand pricing algorithm in a single self-contained file. | [`src/economy/pricingEngine.ts`](file:///C:/Users/fawaz/Desktop/GAME/src/economy/pricingEngine.ts) |
| **Merchant Reasoning in Tooltips** | Live telemetry explaining *why* price changed (inventory ratio, demand factor, overhead status). | [`src/ui/app.ts`](file:///C:/Users/fawaz/Desktop/GAME/src/ui/app.ts) & [`src/economy/pricingEngine.ts`](file:///C:/Users/fawaz/Desktop/GAME/src/economy/pricingEngine.ts) |
| **Fast-Forward Simulator Mode** | 7-day time warp button simulating autonomous AI racing trades, cash reserves, and bankruptcies. | [`src/economy/pricingEngine.ts`](file:///C:/Users/fawaz/Desktop/GAME/src/economy/pricingEngine.ts) |

---

## 🛠️ Run Locally in 30 Seconds

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```

Open the printed localhost URL (default `http://localhost:3000`) in your browser to play immediately!

---

## 🎮 Controls

* **Accelerate:** `W` or `↑`
* **Brake / Reverse:** `S` or `↓`
* **Steer / Drift:** `A` / `D` or `←` / `→`
* **Nitrous Boost (NOS):** `Spacebar`
