# NEAR Circuit

**Race the road. Understand the network.**

NEAR Circuit is a 2D side-scrolling racing adventure that teaches blockchain fundamentals and the NEAR ecosystem through playable missions, experiments, real-world ecosystem discovery and an evolving in-game economy.

> This repository is an early playable prototype. Racing, Academy modules, local progression and the local merchant simulation work in the browser. NEAR authentication, the NEP-245 contract, wallet-backed merchant agents and live NEAR Intents execution are not connected yet. The interface labels teaching simulations clearly so they are not mistaken for on-chain transactions.

## Run locally

Requirements: Node.js 20 or newer.

1. Clone the repository.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the local URL printed by Vite (normally `http://localhost:5173`).
5. Select **Enter the circuit** to play, or open **NEAR Academy** to start the learning campaign.

## Controls

| Action | Keyboard |
| --- | --- |
| Accelerate | `D` or `→` |
| Brake | `A` or `←` |
| Lean in the air | `W` / `S` or `↑` / `↓` |
| Boost | `Space` |
| Pause | `Esc` |

On narrow screens, touch controls appear under the race canvas.

## What's in the prototype

- **Side-scrolling racing:** Genesis Ridge and Asset Canyon, an original rally-buggy sprite, momentum, slopes, ramps, hazards, air control, boost, rival pacing, signal pickups, a finish line and race rewards.
- **NEAR Academy:** Eight structured modules covering blockchain fundamentals, NEAR Protocol, accounts and wallets, transactions and smart contracts, NEP-245, the NEAR ecosystem, NEAR Intents and chain abstraction, and AI agents.
- **Hands-on learning:** Shared-ledger verification, a simplified network round, transaction lifecycle, multi-token locker, ecosystem districts, intent route comparison and a merchant-agent decision demo.
- **Agent market:** Three independent merchant simulations with inventory, balances, demand-based pricing, daily operating costs, reasoning, closures/reopening and a seven-day fast-forward.
- **Garage and Codex:** Local equipment ownership, loadout and a reference library for completed lessons.
- **Sound feedback:** Synthesised interface clicks, collectible cues and a finish chime, with a mute toggle.
- **Ecosystem City:** Curated categories and examples linked to official NEAR resources.

## Architecture

```text
src/
  content/       # Tracks, Academy curriculum and ecosystem districts
  game/
    economy/     # Deterministic merchant and pricing rules
    racing/      # Race inputs and simulation state
    store.ts     # Serializable local save state
  phaser/
    scenes/      # Phaser rendering and input bridge
  ui/            # DOM menus, Academy, market, garage and HUD
  main.ts        # Vite entry point
```

The original rally-buggy art is in `public/assets/rally-buggy.png`. The race simulation and market rules are plain TypeScript modules. Phaser is the renderer and input adapter, not the source of truth for saveable game state. Text-heavy Academy content and menus are DOM UI layered around the canvas.

## Development commands

```bash
npm run dev       # Start Vite
npm run build     # Type-check and create a production build
npm run preview   # Preview the production build
npm test          # Run unit tests
```

## NEAR integration boundary

The current prototype stores player progress in browser `localStorage` and uses local credits. The next integration milestone is deliberately separated from the game loop:

1. Add NEAR social/email onboarding and a server-verified player account session.
2. Deploy and test the NEP-245 equipment contract on NEAR testnet.
3. Add an adapter that reads and writes token ownership from the contract.
4. Give each merchant a dedicated account and narrowly scoped server-side signing permissions.
5. Settle purchases in the garage or market, never per movement frame.
6. Add NEAR Intents only for a real outcome-based purchase flow after the relevant supported API and asset pair are confirmed.

Never place private keys, relayer secrets or service-role keys in client code. Use `.env.example` as a reminder of the future public configuration values; do not commit real secrets.

## Game design documents

- [Game design](docs/GAME_DESIGN.md)
- [NEAR learning curriculum](docs/NEAR_LEARNING_CURRICULUM.md)
- [Build milestones and acceptance checks](docs/BUILD_PLAN.md)
- [Agent instructions](AGENTS.md)

## Design / implementation skill

The project follows the open-source **Web Game Development** agent skill by AgiOracle. Its workflow recommends Phaser + TypeScript + Vite for side-view browser games, a simulation/rendering boundary, DOM-based game UI, stable asset/data boundaries and screenshot-based playtesting.

- Skill: <https://github.com/agioracle/web-game-development-skills>
- Licence: MIT. The skill is referenced as project guidance; this repository does not bundle the third-party skill source.

## Sources for the learning content

The Academy links to primary NEAR resources so players can continue learning beyond the game:

- <https://docs.near.org/>
- <https://docs.near.org/protocol/accounts>
- <https://docs.near.org/protocol/network/overview>
- <https://docs.near.org/smart-contracts/what-is>
- <https://github.com/near/NEPs/blob/master/neps/nep-0245.md>
- <https://www.near.org/ecosystem>
- <https://docs.near-intents.org/>
- <https://near.ai/>

## Status

Prototype version `0.1.0`. The source has passed strict TypeScript checking with the Phaser API surface isolated, and the pure race/economy simulations have been exercised directly. A full Vite/browser build and visual playtest still need to be run after dependencies are installed. See the build plan for what is implemented, simulated and still pending.
