# NEAR Circuit

**Race the road. Understand the network.**

NEAR Circuit is a browser-based side-scrolling racing game with a beginner-friendly NEAR Academy. Players can race, explore eight lessons, visit ecosystem districts and inspect a local merchant-market simulation.

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Vite prints the local development URL. For a production build:

```bash
npm run build
npm run preview
```

## Play

- Accelerate: `D` or `→`
- Brake: `A` or `←`
- Boost: `Space`
- Mobile: use the on-screen controls below the track.

Choose **Enter the circuit** to race or open **NEAR Academy** to start learning.

## Learning campaign

The Academy includes eight modules: blockchain fundamentals, NEAR Protocol, accounts and wallets, transactions and smart contracts, NEP-245, the NEAR ecosystem, NEAR Intents and chain abstraction, and AI agents. Every module includes learning points, a small interactive experiment, a mastery question and a link to a primary resource.

Progress and local credits are stored in the browser. They are not blockchain assets.

## What's implemented

- Browser-playable side-view racing canvas with acceleration, braking, boost, distance and finish rewards.
- Eight NEAR Academy modules with progress tracking and knowledge checks.
- Ecosystem City with categories and external resource links.
- Local merchant market and a seven-day simulation control.
- Responsive navigation and touch buttons.
- Local save using browser storage.

## Important integration status

This deployed prototype is a local educational game. It does **not** yet connect NEAR social login, a NEP-245 contract, merchant wallets, NEAR Intents execution or Supabase. No real blockchain transaction is sent, and credits/equipment have no real-world value. These integrations require separate testnet contracts, secure server-side signing and verified transactions.

## Design documents

- `docs/GAME_DESIGN.md`
- `docs/NEAR_LEARNING_CURRICULUM.md`
- `docs/BUILD_PLAN.md`

## Sources

- [NEAR documentation](https://docs.near.org/)
- [NEAR ecosystem directory](https://www.near.org/ecosystem)
- [NEP-245 specification](https://github.com/near/NEPs/blob/master/neps/nep-0245.md)
- [NEAR Intents documentation](https://docs.near-intents.org/)
- [NEAR AI](https://near.ai/)

## Game development skill

Project structure and game design guidance draw on [Web Game Development by AgiOracle](https://github.com/agioracle/web-game-development-skills).
