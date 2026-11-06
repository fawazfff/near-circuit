/**
 * NEAR ACADEMY: UNDERGROUND RACER'S CURRICULUM
 * Teaches core NEAR architectural primitives through the lens of high-performance racing.
 */

import { AcademyLesson } from '../types';

export const ACADEMY_LESSONS: AcademyLesson[] = [
  {
    id: 'lesson_fastauth',
    number: '01',
    title: 'Instant Ignition: FastAuth & Session Keys',
    category: 'ONBOARDING & UX',
    summary: 'How NEAR eliminates the 12-word seed phrase barrier and wallet confirmation popups during live action.',
    racingAnalogy: 'Imagine if you had to sign a paper waiver every time you pressed the brake or shifted gear. In Web3 gaming, bad UX pauses the game with wallet popups. NEAR session keys pre-authorize race actions for zero interruptions.',
    nearConcept: 'FastAuth uses WebAuthn/passkeys paired with limited-permission Function Call Access Keys. The contract only allows calling designated game methods without ever risking your main account assets.',
    interactiveDemo: {
      prompt: 'Request an ephemeral Session Key with 0.25 NEAR gas allowance.',
      actionLabel: 'GENERATE SESSION KEY',
      resultText: 'Session Key active (ed25519:7k9x...4m2q). You can now race, drift, and shift without sign prompts!'
    },
    quiz: {
      question: 'Why are session keys essential for real-time Web3 games?',
      options: [
        'They give the game full control over your entire bank account.',
        'They allow pre-authorized smart contract actions so gameplay is never interrupted by wallet approval dialogs.',
        'They make your computer run at a higher clock speed.'
      ],
      correctIndex: 1,
      explanation: 'Session keys (Function Call Keys on NEAR) hold restricted allowances for game actions, enabling 60 FPS gameplay without modal popups.'
    }
  },
  {
    id: 'lesson_sharding',
    number: '02',
    title: 'Parallel Circuits: Nightshade Sharding',
    category: 'NETWORK SCALABILITY',
    summary: 'Why gas fees remain virtually zero even when 10,000 racers launch simultaneously on race night.',
    racingAnalogy: 'A single-lane highway gets jammed immediately when 500 cars enter. Sharding adds 6 parallel express highways that process traffic concurrently.',
    nearConcept: 'NEAR uses Nightshade sharding. Blocks are split into chunks processed by different validator subsets. State, compute, and bandwidth scale horizontally as player count multiplies.',
    interactiveDemo: {
      prompt: 'Simulate 5,000 concurrent racers entering Shard 0 (Downtown) and Shard 1 (Highway).',
      actionLabel: 'DISTRIBUTE NETWORK LOAD',
      resultText: 'Parallel shard processing completed: 5,000 tx/sec processed in 0.8s with gas fee unchanged at $0.0001!'
    },
    quiz: {
      question: 'What happens to gas fees on NEAR when transaction volume surges dramatically?',
      options: [
        'Gas fees skyrocket to $50 per transaction like older blockchains.',
        'The network shards into additional chunks, preserving low fees and fast finality.',
        'Transactions are discarded and games must pause for an hour.'
      ],
      correctIndex: 1,
      explanation: 'Nightshade dynamic resharding splits heavily loaded shards so transaction throughput scales up while keeping fees predictable.'
    }
  },
  {
    id: 'lesson_nep245',
    number: '03',
    title: 'The Unified Trunk: NEP-245 Multi-Tokens',
    category: 'SMART CONTRACTS',
    summary: 'Managing nitro canisters, slick tires, turbo upgrades, and garage equity in a single efficient smart contract.',
    racingAnalogy: 'Instead of having 4 separate warehouses with 4 different dispatchers for tires, oil, wrenches, and fuel, you have one streamlined master inventory bay.',
    nearConcept: 'NEP-245 is NEAR\'s Multi-Token Standard (similar to ERC-1155). It supports fungible tokens (like 100x NOS canisters), non-fungible items (unique cars), and semi-fungible items in one single contract address.',
    interactiveDemo: {
      prompt: 'Execute a batch transfer: Equip 1x NOS + 1x Slicks in a single atomic transaction.',
      actionLabel: 'BATCH TRANSFER VIA NEP-245',
      resultText: 'Atomic batch transfer successful: 2 distinct token types transferred in 1 execution receipt!'
    },
    quiz: {
      question: 'What is the primary benefit of the NEP-245 Multi-Token standard over deploying multiple separate tokens?',
      options: [
        'It allows managing consumables, unique gear, and shares under one single contract with atomic multi-item transfers.',
        'It only works for high-speed sports cars.',
        'It prevents other players from ever seeing your inventory.'
      ],
      correctIndex: 0,
      explanation: 'NEP-245 saves deployment overhead, storage staking costs, and enables multi-item atomic transfers in a single call.'
    }
  },
  {
    id: 'lesson_agents',
    number: '04',
    title: 'Autonomous Pit Crews: AI Agents with Wallets',
    category: 'AGENTIC ECONOMIES',
    summary: 'Why NPC merchants in NEAR Circuit hold their own cryptographic keys, manage balances, and can go bankrupt.',
    racingAnalogy: 'Traditional NPC shopkeepers are cardboard cutouts with infinite items and frozen prices. In NEAR Circuit, mechanics are real economic agents who must pay bay rent and manage cash flow.',
    nearConcept: 'NEAR accounts are named human-readable accounts (`elena.tires.near`) with built-in access key rotation and multi-party computation (MPC). Autonomous agents can sign transactions, run pricing algorithms, and form economic syndicates.',
    interactiveDemo: {
      prompt: 'Inspect Dex\'s autonomous wallet balance sheet and rent deduction.',
      actionLabel: 'INSPECT AGENT LEDGER',
      resultText: 'Agent ledger verified: Dex holds 45.0 NEAR, owes 12.0 NEAR overhead, and adjusts turbo pricing automatically based on inventory scarcity.'
    },
    quiz: {
      question: 'How do autonomous NPC agents differ from static NPC shopkeepers in Web2 games?',
      options: [
        'They are programmed to never sell items to new players.',
        'They hold verifiable on-chain balances, adjust prices by bonding curves, and can actually go bankrupt if unmanaged.',
        'They only talk through audio files.'
      ],
      correctIndex: 1,
      explanation: 'Autonomous economic agents possess live balance sheets, react to real market supply/demand, and interact trustlessly on-chain.'
    }
  },
  {
    id: 'lesson_intents',
    number: '05',
    title: 'Pit Lane Swaps: NEAR Intents & Chain Abstraction',
    category: 'INTENTS ARCHITECTURE',
    summary: 'Express what outcome you want; let decentralized solver networks route the best trade across any asset.',
    racingAnalogy: 'You pull into the pit lane and yell: "Give me fresh tires and fill my tank!" You don\'t want to manually exchange currency, visit 3 booths, and sign 4 receipts.',
    nearConcept: 'NEAR Intents turn user actions into declarative goals ("Swap 5 NEAR for 1 Nitro at best price"). Specialized off-chain solvers compete to deliver the optimal fulfillment on-chain.',
    interactiveDemo: {
      prompt: 'Publish an Intent: "Exchange 1 Used Tire + 3 NEAR for 1 High-Octane NOS".',
      actionLabel: 'SOLVE INTENT ACROSS PADDOCK',
      resultText: 'Solver matched trade in 120ms with Marcus\'s garage: 0 slippage, zero bridge delay!'
    },
    quiz: {
      question: 'What is the fundamental idea behind the Intent-centric architecture on NEAR?',
      options: [
        'Users specify the desired end state, and specialized solvers execute the multi-step route to fulfill it optimally.',
        'Users must manually write assembly code for each transaction.',
        'All games must be paused until an administrator approves the trade.'
      ],
      correctIndex: 0,
      explanation: 'Intents abstract away the complexity of step-by-step transaction routing; users define what they want, and solvers deliver it.'
    }
  }
];
