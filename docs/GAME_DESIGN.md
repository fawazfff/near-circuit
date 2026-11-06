# NEAR Circuit — Game Design

## High concept

A 2D side-scrolling arcade racing adventure in which players learn blockchain fundamentals, the NEAR Protocol and the wider NEAR ecosystem through playable missions, experiments and economic decisions.

**Tagline:** Race the road. Understand the network.

## Player fantasy

The player is a rookie racer entering a championship that travels through regions inspired by the building blocks of the NEAR ecosystem. Each new circuit introduces a new mechanical challenge and a concept to understand. The player races, discovers, upgrades, trades, experiments and gradually becomes an informed ecosystem explorer.

## Design pillars

1. **Racing first:** responsive acceleration, momentum, slopes, jumps, air control and short high-replayability routes.
2. **Learning by doing:** every Academy module includes a plain-language lesson, an interaction, a concise explanation and a mastery check.
3. **A living paddock:** merchant agents maintain inventories and budgets, adjust prices from stock and demand, and can close or recover.
4. **Honest on-chain integration:** actual ownership and settlement use NEAR; local simulations are explicitly labelled until connected.
5. **Readable art direction:** warm industrial rally environments, graphite UI, signal-lime highlights and restrained orange/teal accents.

## Core loop

1. Choose a circuit and review its region objective.
2. Race for approximately 60–90 seconds, using momentum, jumps, boost and route choices.
3. Collect signal fragments and finish to earn local credits and Academy XP.
4. Visit the garage to equip parts or the market to compare merchants.
5. Complete a region-linked Academy module or discover a new ecosystem district.
6. Return to the circuit with a better understanding and a new setup.

## Controls

- Accelerate: D / Right Arrow
- Brake: A / Left Arrow
- Lean: W/S or Up/Down
- Boost: Space
- Pause: Escape
- Touch: on-screen Brake, Lean, Gas and Boost controls

## Racing mechanics

- Side-view camera follows the player horizontally.
- Procedural deterministic terrain is seeded per circuit.
- Vehicle simulation owns horizontal speed, vertical velocity, slope contact, air time, rotation, boost and pickup state.
- A rival buggy follows a deterministic pace line and provides a live position comparison; it is a pacing opponent, not a full pathfinding AI in the prototype.
- Signal pickups award local game credits; boost pickups replenish the local boost meter.
- Bronze/silver/gold medals are based on finish-time thresholds.

## Progression

- Racer XP and level.
- Circuit best times and medals.
- Local credits.
- Equipment inventory and equipped loadout.
- Academy module completions and Codex entries.
- Circuit unlocks and regional badges are planned; the prototype exposes the first two circuits.

## Equipment

| Part | Effect | Slot |
|---|---|---|
| Grip tyres | Better traction | Handling |
| Suspension kit | Better landing stability | Suspension |
| Engine chip | Faster acceleration | Power |
| Boost cell | More boost reserve | Boost |
| Carbon frame | Higher top speed, less stability | Chassis |
| Reinforced frame | More impact resistance | Chassis |

## Regions

- Genesis Ridge: onboarding, blockchain/network basics, first race.
- Asset Canyon: equipment, tokens, digital ownership and NEP-245.
- Agent District: merchant agents, inventory and a living economy.
- Intent Highway: outcome-based requests and NEAR Intents.
- Chain Frontier: chain abstraction and cross-chain thinking.

The first two regions are the playable racing prototype. The others are learning/world expansion targets.

## Market system

Three independent merchant simulations:

- GripWorks: tyres and suspension.
- TurboLab: engines and boost cells.
- Apex Salvage: chassis and rarer equipment.

Each merchant has a wallet/account integration target, balance, target reserve, inventory, target inventory, base prices, demand and reputation. Pricing uses current stock and recent demand. Merchants also pay daily operating costs, so a garage with no stock or sales can become insolvent and close. Players can invest to reopen it. The merchant explanation is derived from those same variables. A seven-day simulation advances merchant sales, restocking, balances, prices, insolvency and reopening.

## Economy formula

For an item:

`stockPressure = 0.5 * (targetStock - stock) / targetStock`

`demandPressure = 0.2 * (demand - 1)`

`price = round(basePrice * clamp(1 + stockPressure + demandPressure, 0.6, 2.0))`

This is a deliberately small, inspectable starting rule. It should be tuned with playtest data, not hidden behind a language model.

## Learning design

Each Academy module follows:

1. Discover the concept in a short story.
2. Experience it through a simulation or game interaction.
3. Understand the outcome with a plain-language explanation.
4. Master it with a short quiz or practical task.

The Codex stores completed lessons. The Ecosystem Explorer links to official directories and resources.

## Visual direction

- Palette: carbon/forest base, off-white text, signal lime, burnt orange and cool teal.
- Typography: compact grotesk display with monospaced technical labels.
- World: rally-inspired terrain, industrial depots, canyon rock, network relay towers and warm horizon light.
- Vehicle: chunky compact rally buggy, visible suspension/wheels and a bright roof/side signal stripe.
- Motion: short transitions for navigation, bounce on pickups, subtle car idle animation, impact feedback and controlled parallax.
- Anti-patterns: no generic SaaS dashboards, no excessive glowing gradients, no fake testimonials, no token price speculation, no unreadable HUD cards over the track.

## Session structure

A first-time session should take 5–10 minutes: onboarding race, one Academy module, first garage visit and a market purchase/inspection. A repeat session should allow a fast race, a quick market decision and one deeper lesson.
