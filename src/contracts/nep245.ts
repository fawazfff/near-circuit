/**
 * NEAR NEP-245 MULTI-TOKEN SPECIFICATION & SESSION KEY HARNESS
 * 
 * Hackathon Track 09 Requirement:
 * "Items are NEP-245 multi tokens, so one contract holds every item type.
 * Players sign in with a social or email login. No seed phrases, no wallet popups,
 * no gas prompts in the normal game loop."
 */

import { NEP245Item, TokenId } from '../types';

export const NEP245_CATALOG: Record<TokenId, NEP245Item> = {
  item_nos: {
    id: 'item_nos',
    name: 'NOS Nitro Boost Canister',
    category: 'consumable',
    description: 'Press Space to activate sudden rocket acceleration (+180 km/h thrust). 1 canister used per race.',
    durabilityCostPerRace: 1,
    effect: '+60% Top Acceleration & Speed Burst'
  },
  item_slicks: {
    id: 'item_slicks',
    name: 'Track Soft Slicks',
    category: 'consumable',
    description: 'High-friction polymer racing compound. Prevents spin-outs during high-speed drifts.',
    durabilityCostPerRace: 1,
    effect: '+45% Cornering Grip & Road Adhesion'
  },
  item_turbo: {
    id: 'item_turbo',
    name: 'Stage-2 Twin-Scroll Turbo',
    category: 'upgrade',
    description: 'Permanently increases baseline engine horsepower and top cruising speed to 340 km/h.',
    effect: '+40 km/h Max Speed & Permanent Turbo Spool'
  },
  share_marcus: {
    id: 'share_marcus',
    name: 'Marcus Nitro Syndicate Share',
    category: 'syndicate_share',
    description: 'Proof of equity token in Marcus Vance\'s fuel depot. Earns passive NEAR dividends on street purchases.',
    effect: 'Automated 15% Sale Royalty Payouts'
  },
  share_elena: {
    id: 'share_elena',
    name: 'Elena Grip Works Syndicate Share',
    category: 'syndicate_share',
    description: 'Proof of equity token in Elena\'s tire compound lab. Earns dividends on all slick tire sales.',
    effect: 'Automated 15% Sale Royalty Payouts'
  },
  share_dex: {
    id: 'share_dex',
    name: 'Apex Turbo Labs Syndicate Share',
    category: 'syndicate_share',
    description: 'Proof of equity token in Dex\'s turbo tuning bay. Earns dividends on all high-end ECU/turbo sales.',
    effect: 'Automated 15% Sale Royalty Payouts'
  }
};

/**
 * MOCK ON-CHAIN NEP-245 CONTRACT STATE
 * In production, this compiles to near-sdk-rs or near-sdk-js NEP-245 contract.
 */
export class NEP245MultiTokenContract {
  public contractAddress: string = 'circuit-items.game.near';
  private balances: Map<string, Map<TokenId, number>> = new Map();

  constructor() {
    // Initial balances
  }

  public balanceOf(accountId: string, tokenId: TokenId): number {
    const userTokens = this.balances.get(accountId);
    if (!userTokens) return 0;
    return userTokens.get(tokenId) || 0;
  }

  public mint(to: string, tokenId: TokenId, amount: number): { txHash: string; status: string } {
    if (!this.balances.has(to)) {
      this.balances.set(to, new Map());
    }
    const userTokens = this.balances.get(to)!;
    const current = userTokens.get(tokenId) || 0;
    userTokens.set(tokenId, current + amount);

    const txHash = '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    return {
      txHash,
      status: `Successfully minted ${amount}x ${NEP245_CATALOG[tokenId]?.name || tokenId} to ${to} on NEP-245 contract.`
    };
  }

  public nft_transfer(from: string, to: string, tokenId: TokenId, amount: number = 1): boolean {
    const fromTokens = this.balances.get(from);
    if (!fromTokens) return false;
    const current = fromTokens.get(tokenId) || 0;
    if (current < amount) return false;

    fromTokens.set(tokenId, current - amount);

    if (!this.balances.has(to)) {
      this.balances.set(to, new Map());
    }
    const toTokens = this.balances.get(to)!;
    toTokens.set(tokenId, (toTokens.get(tokenId) || 0) + amount);

    return true;
  }
}

/**
 * SESSION KEY (FASTAUTH) EMULATOR
 * Issues an in-memory keypair stored in browser memory with limited gas allowance,
 * so all item equips, race rewards, and merchant swaps execute seamlessly with ZERO popups.
 */
export function generateSessionKey(accountId: string): { sessionKey: string; expiresAt: Date } {
  const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const sessionKey = `ed25519:${randomHex.substring(0, 44)}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return { sessionKey, expiresAt };
}
