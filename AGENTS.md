# NEAR Circuit agent instructions

## Project intent

Build NEAR Circuit as a real 2D side-scrolling racing game with a structured NEAR learning campaign and an evolving economy. Do not turn it into a generic dashboard, a farming/collecting clone or a series of quiz cards with a car attached.

## Required design constraints

- The racing must be enjoyable without prior blockchain knowledge.
- The Academy must teach actual concepts with a short explanation, a hands-on experiment, an explanation of what happened and a mastery check.
- The Ecosystem Explorer must describe real NEAR ecosystem categories and link to primary sources. Never invent project capabilities or imply endorsements.
- The market must show why an NPC price or business decision changed. Explanations must be derived from the simulation state and pricing rules, not improvised by an LLM.
- Label simulated wallet, token, Intents and transaction demos clearly. Never claim a local demo has sent an on-chain transaction.
- Do not claim a NEAR integration is complete until it has been tested against the correct network and contract.

## Architecture rules

- Use Phaser 4 + TypeScript + Vite for the 2D browser game.
- Keep simulation state and business rules in `src/game/`, outside Phaser scenes.
- Phaser scenes render state and translate input into simulation actions. Do not make renderer objects the source of truth.
- Keep keyboard/touch action mappings explicit in one input module.
- Use DOM for text-heavy menus, Academy lessons, inventory, market and HUD.
- Save serializable data only. Never save Phaser objects, graphics, scenes or timers.
- Keep source files small enough to test independently.

## Quality bar

- Run `npm test` and `npm run build` after meaningful changes.
- Play the first run from a clean local save.
- Verify keyboard and touch controls, pause/resume, route completion, rewards, market purchases, merchant reasoning and Academy quiz progress.
- Check desktop and mobile layouts. The playfield should remain readable and overlays should not cover important movement space.
- Respect `prefers-reduced-motion`.

## Security

- Never add real private keys, account seeds, relayer credentials or Supabase service-role keys to client files or Git history.
- Keep future signing and privileged wallet actions behind a server-side boundary with narrow permissions and auditable limits.

## Design skill reference

Use the workflow and principles from:

- https://github.com/agioracle/web-game-development-skills
- `references/phaser-2d.md`
- `references/phaser-architecture.md`
- `references/ui-frontend.md`
- `references/playtest.md`

The skill recommends defining the game fantasy and core loop first, separating simulation from rendering, using DOM overlays for dense UI, then verifying the browser game through real playtests and screenshots.
