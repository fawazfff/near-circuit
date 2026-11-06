export type AcademyDemo = 'ledger' | 'network' | 'transaction' | 'assets' | 'ecosystem' | 'intents' | 'agents';

export interface AcademyModule {
  id: string;
  number: string;
  title: string;
  eyebrow: string;
  summary: string;
  duration: string;
  difficulty: 'STARTER' | 'INTERMEDIATE';
  learningPoints: string[];
  demo: AcademyDemo;
  demoTitle: string;
  demoDescription: string;
  quiz: { question: string; options: string[]; answer: number; explanation: string };
  sourceLabel: string;
  sourceUrl: string;
}

export const ACADEMY_MODULES: AcademyModule[] = [
  {
    id: 'blockchain-basics', number: '01', title: 'A record everyone can verify', eyebrow: 'BLOCKCHAIN FUNDAMENTALS',
    summary: 'Understand what a blockchain is, why records are shared, and how independent participants can agree on what happened.',
    duration: '6 MIN', difficulty: 'STARTER',
    learningPoints: ['A blockchain is a shared record maintained by a network of computers.', 'Transactions are grouped into blocks and linked into a history.', 'Consensus rules help participants agree on the accepted history.', 'A blockchain is different from a database controlled by one organisation.'],
    demo: 'ledger', demoTitle: 'The shared race log', demoDescription: 'Submit a race result, then ask independent network participants to verify the same record.',
    quiz: { question: 'What makes a public blockchain different from a normal company database?', options: ['One company controls every record', 'A network follows shared rules to maintain and verify records', 'It only stores images'], answer: 1, explanation: 'A public blockchain is maintained by a network of participants that follow shared protocol rules.' },
    sourceLabel: 'NEAR documentation', sourceUrl: 'https://docs.near.org/',
  },
  {
    id: 'near-protocol', number: '02', title: 'Meet the NEAR network', eyebrow: 'NEAR PROTOCOL',
    summary: 'Learn what NEAR Protocol does, how validators help secure it, and why the network is designed to scale.',
    duration: '7 MIN', difficulty: 'STARTER',
    learningPoints: ['NEAR Protocol is a proof-of-stake Layer 1 blockchain.', 'Validators participate in consensus and help secure the network.', 'Nightshade is NEAR’s sharding design for parallelising network work.', 'NEAR accounts and smart contracts use the network to record and execute actions.'],
    demo: 'network', demoTitle: 'Inside a network round', demoDescription: 'Run a simplified network round and see how validators and shards fit into the picture.',
    quiz: { question: 'What is the main role of validators in a proof-of-stake network?', options: ['Design every game level', 'Help validate and secure the network according to protocol rules', 'Set the price of every token'], answer: 1, explanation: 'Validators participate in the network’s consensus and security process. They do not set app prices or design user interfaces.' },
    sourceLabel: 'NEAR Protocol docs', sourceUrl: 'https://docs.near.org/protocol/network/overview',
  },
  {
    id: 'accounts-wallets', number: '03', title: 'Your account is your pit pass', eyebrow: 'ACCOUNTS & WALLETS',
    summary: 'Explore NEAR accounts, wallet interfaces, public account identifiers, keys and transaction signatures.',
    duration: '7 MIN', difficulty: 'STARTER',
    learningPoints: ['A NEAR account is an on-chain identity that can own assets and interact with contracts.', 'A wallet is an interface for managing accounts and authorising actions.', 'A public account ID can be shared; private keys must stay secret.', 'A signature proves that an authorised key approved a transaction.'],
    demo: 'transaction', demoTitle: 'Authorise a pit-stop purchase', demoDescription: 'Walk through a wallet action: choose an item, review the request, authorise it and inspect the result.',
    quiz: { question: 'Which piece of information should never be shared publicly?', options: ['Your public account ID', 'A transaction explorer link', 'Your private key or recovery phrase'], answer: 2, explanation: 'Private keys and recovery phrases give control over an account and must remain secret.' },
    sourceLabel: 'NEAR accounts documentation', sourceUrl: 'https://docs.near.org/protocol/accounts',
  },
  {
    id: 'smart-contracts', number: '04', title: 'Programs that live on-chain', eyebrow: 'TRANSACTIONS & SMART CONTRACTS',
    summary: 'See how transactions call smart contracts, how gas is used, and how applications can build predictable rules around assets.',
    duration: '8 MIN', difficulty: 'INTERMEDIATE',
    learningPoints: ['A smart contract is a program deployed to a blockchain.', 'A transaction can call a contract method and change on-chain state.', 'Gas accounts for computation and storage resources used by an action.', 'Applications read contract state and present it in a usable interface.'],
    demo: 'transaction', demoTitle: 'Follow a contract call', demoDescription: 'Trace an equipment purchase from the player’s approval to contract execution and a result.',
    quiz: { question: 'What happens when a transaction calls a smart contract?', options: ['The browser changes a picture only', 'The network executes the contract method under protocol rules', 'The transaction skips network validation'], answer: 1, explanation: 'A contract call is processed by the network and can update contract state when it succeeds.' },
    sourceLabel: 'NEAR smart contracts docs', sourceUrl: 'https://docs.near.org/smart-contracts/what-is',
  },
  {
    id: 'digital-assets', number: '05', title: 'Own the parts you collect', eyebrow: 'TOKENS & DIGITAL OWNERSHIP',
    summary: 'Understand token types and how NEP-245 lets one multi-token contract represent different kinds of assets.',
    duration: '8 MIN', difficulty: 'INTERMEDIATE',
    learningPoints: ['Tokens are digital units represented and managed by a contract.', 'Different token standards support different asset behaviours.', 'NEP-245 defines a multi-token standard for NEAR.', 'A token transfer changes the recorded owner or balance under contract rules.'],
    demo: 'assets', demoTitle: 'The multi-token parts locker', demoDescription: 'Collect different equipment types, inspect their token IDs and transfer one to another account in a local teaching simulation.',
    quiz: { question: 'What is a key idea behind NEP-245?', options: ['One contract can manage multiple token types', 'It is a racing physics engine', 'It replaces validators'], answer: 0, explanation: 'NEP-245 is a multi-token standard. One contract can manage many token types and their balances.' },
    sourceLabel: 'NEP-245 specification', sourceUrl: 'https://github.com/near/NEPs/blob/master/neps/nep-0245.md',
  },
  {
    id: 'ecosystem', number: '06', title: 'Explore the builders and apps', eyebrow: 'THE NEAR ECOSYSTEM',
    summary: 'Discover the kinds of products built around NEAR: wallets, DeFi, infrastructure, developer tools, AI and games.',
    duration: '10 MIN', difficulty: 'STARTER',
    learningPoints: ['A blockchain ecosystem includes user applications, wallets, infrastructure and developer tools.', 'DeFi applications provide financial functions such as swaps, lending and liquidity.', 'Infrastructure projects help applications connect to, monitor or build on networks.', 'AI and agent projects explore software that can act on behalf of users under defined permissions.'],
    demo: 'ecosystem', demoTitle: 'Ecosystem City', demoDescription: 'Walk through five districts and inspect real ecosystem categories and projects from the official directory.',
    quiz: { question: 'Which of these is part of a blockchain ecosystem?', options: ['Only the base blockchain', 'Applications, wallets, infrastructure, tools and communities', 'Only token prices'], answer: 1, explanation: 'An ecosystem includes the network and the products, tools, teams and communities built around it.' },
    sourceLabel: 'Official NEAR ecosystem directory', sourceUrl: 'https://www.near.org/ecosystem',
  },
  {
    id: 'intents-abstraction', number: '07', title: 'Ask for the outcome', eyebrow: 'INTENTS & CHAIN ABSTRACTION',
    summary: 'Understand how an intent describes a desired result and how chain abstraction can hide network-by-network complexity.',
    duration: '8 MIN', difficulty: 'INTERMEDIATE',
    learningPoints: ['An intent expresses an outcome the user wants to achieve.', 'NEAR Intents coordinates execution through participants called solvers.', 'Chain abstraction aims to make multi-chain actions feel simpler to users.', 'An intent demo in this game is educational unless a real Intents integration is connected.'],
    demo: 'intents', demoTitle: 'Route to the requested upgrade', demoDescription: 'Set an outcome and compare illustrative routes. This is a learning simulation, not a live NEAR Intents order.',
    quiz: { question: 'What does an intent primarily describe?', options: ['The exact clicks a user must make', 'The outcome the user wants to achieve', 'A car’s steering angle'], answer: 1, explanation: 'An intent describes the desired result. Execution details can be handled by a solver or execution system.' },
    sourceLabel: 'NEAR Intents', sourceUrl: 'https://docs.near-intents.org/',
  },
  {
    id: 'agent-economy', number: '08', title: 'Meet the agent economy', eyebrow: 'AI AGENTS & AUTONOMOUS ACTIVITY',
    summary: 'Explore how software agents can make decisions, use tools and act economically under controlled permissions.',
    duration: '7 MIN', difficulty: 'INTERMEDIATE',
    learningPoints: ['An AI agent can observe context, choose actions and use tools toward a goal.', 'An agent with access to a wallet needs strict permission boundaries.', 'Agent actions should be observable and explainable.', 'NEAR is developing infrastructure for an economy where agents and people can transact.'],
    demo: 'agents', demoTitle: 'A garage makes a decision', demoDescription: 'Inspect a merchant agent’s inventory, demand and budget, then see why it changes a price or restocks.',
    quiz: { question: 'What is a sensible safety rule for an agent that can spend funds?', options: ['Give it unrestricted access to every secret', 'Use scoped permissions, limits and an audit trail', 'Hide all its actions from the user'], answer: 1, explanation: 'Wallet-capable agents should have narrow permissions, spending limits and observable actions.' },
    sourceLabel: 'NEAR AI', sourceUrl: 'https://near.ai/',
  },
];

export const ECOSYSTEM_DISTRICTS = [
  { id: 'wallets', name: 'Wallets & identity', note: 'Ways people manage accounts, keys and access to apps.', examples: ['NEAR Mobile', 'Meteor Wallet', 'HOT Wallet'], source: 'https://wallet.near.org/' },
  { id: 'defi', name: 'DeFi & liquidity', note: 'Apps for swapping, lending, staking and accessing liquidity.', examples: ['Ref Finance', 'Burrow', 'Meta Pool'], source: 'https://www.near.org/ecosystem' },
  { id: 'intents', name: 'Intents & chain abstraction', note: 'Tools that simplify asset movement and actions across networks.', examples: ['NEAR Intents', 'Chain Signatures', 'near.com'], source: 'https://intents.near.org/' },
  { id: 'ai', name: 'AI & agents', note: 'Private inference, agent tooling and software that can act for users.', examples: ['NEAR AI', 'IronClaw'], source: 'https://near.ai/' },
  { id: 'infra', name: 'Infrastructure & builders', note: 'Developer platforms, explorers, APIs and protocol infrastructure.', examples: ['Aurora', 'NEAR One', 'FastNEAR'], source: 'https://www.near.org/ecosystem' },
  { id: 'games', name: 'Games & digital ownership', note: 'Interactive products that use on-chain identity and assets.', examples: ['Explore community-built games in the live directory'], source: 'https://www.near.org/ecosystem' },
];
