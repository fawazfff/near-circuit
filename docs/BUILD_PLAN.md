# NEAR Circuit — Build Plan

## Prototype 0.1.0 status

| Area | Current state | Next work |
|---|---|---|
| Phaser side-scrolling race | Implemented prototype: two circuits, custom buggy sprite, ramps, hazards, pickups and race results; simulation smoke-tested | Run the full browser playtest, tune handling and improve opponent behaviour |
| Academy modules | Eight lessons, interactive demos and mastery checks; quizzes unlock after the experiment | Verify each learning flow in browser and deepen the network/ledger visualisations |
| Ecosystem City | Category cards and linked examples | Load and refresh the official directory data with source attribution |
| Local merchant economy | Three rule-based merchants, inventory, demand pricing, reasoning, purchases and seven-day simulation; smoke-tested over a week | Browser-test insolvency/recovery edge cases and tune multi-week balance |
| Player save | Local browser storage | Add account-bound cloud profile after auth is selected |
| NEAR account login | Not connected | Integrate current NEAR social/email auth flow and testnet session |
| NEP-245 | Not connected | Implement contract, tests, deployment and client adapter |
| Merchant wallets | Not connected | Create accounts and a server-side restricted signer boundary |
| NEAR Intents | Learning simulation only | Integrate only after a concrete product purchase flow is specified and tested |
| Sound | Original synthesised UI clicks, pickup cues and finish chime with mute toggle | Tune volumes and add optional ambient audio if time allows |

## Suggested hackathon build order

1. Finish and playtest the race feel before expanding track count.
2. Confirm every Academy lesson teaches a correct concept and that each demo makes the concept visible.
3. Test the market over multiple simulated weeks; validate pricing, restocking and failure/recovery states.
4. Implement NEAR integration in separate adapters/contracts with testnet tests.
5. Add wallet-backed merchant execution with narrow limits and full event logs.
6. Polish art and sound, test desktop/mobile, and record the demo.

## Verification notes

- Strict TypeScript source check passed using a temporary local Phaser declaration shim because npm dependencies could not be installed in the authoring environment.
- Pure TypeScript simulation smoke tests passed: both circuits completed in approximately 56–63 seconds under sustained drive, and the merchant market advanced seven days and accepted a purchase.
- `npm install`, `npm test`, `npm run build` and visual browser playtesting remain to be run in a normal Node/npm environment.

## Acceptance checklist

### Racing
- [ ] Start either circuit from the paddock.
- [ ] Acceleration, braking, lean and boost respond to keyboard controls.
- [ ] Touch controls work on mobile.
- [ ] Progress, time, speed and boost HUD update during a race.
- [ ] Finish line triggers one result only.
- [ ] Rewards and best time persist after reload.
- [ ] Pause/resume works and leaving a race cleans up the Phaser instance.

### Academy
- [ ] All eight modules open.
- [ ] Each module has learning points, an interactive experiment and a quiz.
- [ ] Correct answer saves completion and XP once.
- [ ] Incorrect answer can be retried.
- [ ] Completed lessons appear in the Codex.
- [ ] Official source links open in a new tab.

### Economy
- [ ] Every merchant has stock, cash, target inventory, demand and pricing rules.
- [ ] Buying an item reduces player credits and stock, then increases merchant balance.
- [ ] Pricing changes are explained from the actual variables.
- [ ] A seven-day simulation advances the market and logs events.
- [ ] Closed merchants can recover through investment or later market activity.

### Security and truthfulness
- [ ] No secrets or private keys in the repository.
- [ ] Local demos are clearly labelled as simulations.
- [ ] No claim of testnet/on-chain completion without a confirmed transaction and explorer link.
- [ ] No real-value claims for local credits or equipment.
