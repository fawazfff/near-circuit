/**
 * NEAR CIRCUIT - AUTONOMOUS MERCHANT PRICING ENGINE
 * 
 * Hackathon Track 09 Requirement:
 * "Merchant pricing rules live in one readable file.
 * Show a merchant's reasoning in a tooltip.
 * If players flood the market, goods get cheap.
 * If a merchant goes broke, it closes its shop until someone invests in it."
 */

import { NPCMerchant, MerchantReasoning, TokenId, EconomyHistoryPoint } from '../types';

export const INITIAL_MERCHANTS: Record<string, NPCMerchant> = {
  marcus: {
    id: 'marcus',
    name: 'Marcus Vance',
    callsign: 'The Nitro Chemist',
    specialty: 'High-Octane NOS & Synthetic Fuels',
    nearAccountId: 'marcus.garage.near',
    walletBalanceNear: 85.0,
    bankrupt: false,
    bailoutCostNear: 30.0,
    playerEquityPercent: 0,
    primaryItemId: 'item_nos',
    primaryItemName: 'High-Octane NOS Canister',
    basePrice: 4.5,
    currentPrice: 4.5,
    inventoryCount: 16,
    maxInventory: 30,
    recentSalesVolume: 5,
    reasoning: {
      headline: 'Balanced Equilibrium',
      inventoryRatio: 0.53,
      demandFactor: 1.0,
      cashReserveStatus: 'healthy',
      explanation: 'Stock is currently stable. Steady street racing demand keeps NOS canister pricing near standard rates.',
      lastPriceAdjustmentPercent: 0
    }
  },
  elena: {
    id: 'elena',
    name: 'Elena Rostova',
    callsign: 'Grip & Apex Specialist',
    specialty: 'Vulcanized Racing Slicks & Suspension',
    nearAccountId: 'elena.tires.near',
    walletBalanceNear: 110.0,
    bankrupt: false,
    bailoutCostNear: 40.0,
    playerEquityPercent: 0,
    primaryItemId: 'item_slicks',
    primaryItemName: 'Track-Compound Racing Slicks',
    basePrice: 8.0,
    currentPrice: 8.0,
    inventoryCount: 10,
    maxInventory: 20,
    recentSalesVolume: 3,
    reasoning: {
      headline: 'Moderate Demand',
      inventoryRatio: 0.5,
      demandFactor: 1.0,
      cashReserveStatus: 'healthy',
      explanation: 'Tire wear rates from recent drift heats are consistent. Factory supply lines open on NEAR shard 0.',
      lastPriceAdjustmentPercent: 0
    }
  },
  dex: {
    id: 'dex',
    name: 'Dex "Spool" Kincaid',
    callsign: 'Apex Turbo Tuner',
    specialty: 'Ceramic Ball-Bearing Turbos & ECU Chips',
    nearAccountId: 'dex.turbos.near',
    walletBalanceNear: 45.0,
    bankrupt: false,
    bailoutCostNear: 50.0,
    playerEquityPercent: 0,
    primaryItemId: 'item_turbo',
    primaryItemName: 'Stage-2 Twin-Scroll Turbocharger',
    basePrice: 28.0,
    currentPrice: 28.0,
    inventoryCount: 4,
    maxInventory: 8,
    recentSalesVolume: 1,
    reasoning: {
      headline: 'Low Liquidity Warning',
      inventoryRatio: 0.5,
      demandFactor: 0.8,
      cashReserveStatus: 'warning',
      explanation: 'Rare ceramic turbine wheels are scarce. High overhead rent from the syndicate puts pressure on operating cash.',
      lastPriceAdjustmentPercent: 0
    }
  }
};

/**
 * DAILY FIXED OVERHEAD / SYNDICATE GARAGE LEASE
 * If an NPC cannot pay this daily upkeep, their wallet goes negative and they enter BANKRUPTCY.
 */
export const DAILY_GARAGE_OVERHEAD: Record<string, number> = {
  marcus: 6.0,
  elena: 7.5,
  dex: 12.0
};

/**
 * CALCULATES DYNAMIC MERCHANT PRICE & REASONING
 * 
 * Rules:
 * 1. Scarcity Multiplier: as inventory drops towards 0, price escalates.
 *    If inventory is flooded (> 85%), price discounts heavily.
 * 2. Demand Factor: high recent transactions cause surge pricing.
 * 3. Bankruptcy: if wallet < 0, shop is shuttered.
 */
export function recalculateMerchantPricing(merchant: NPCMerchant): { newPrice: number; reasoning: MerchantReasoning } {
  if (merchant.bankrupt) {
    return {
      newPrice: 0,
      reasoning: {
        headline: 'GARAGE SHUTTERED - BANKRUPT',
        inventoryRatio: merchant.inventoryCount / merchant.maxInventory,
        demandFactor: 0,
        cashReserveStatus: 'bankrupt',
        explanation: `${merchant.name} ran out of NEAR to pay paddock bay rent. The shop is closed until an outside syndicate racer invests bailout capital.`,
        lastPriceAdjustmentPercent: 0
      }
    };
  }

  const inventoryRatio = Math.max(0.01, merchant.inventoryCount / merchant.maxInventory);
  
  // Demand pressure factor (baseline is 3 sales per cycle)
  const baselineSales = 3;
  const demandFactor = Math.max(0.4, Math.min(2.5, merchant.recentSalesVolume / baselineSales));

  // Scarcity bonding curve: ScarcityFactor = (1 / (ratio + 0.25))^0.55
  // When stock is 10%: multiplier ~ 1.7x (Surge!)
  // When stock is 50%: multiplier ~ 1.1x
  // When stock is 100%: multiplier ~ 0.85x (Surplus discount!)
  const scarcityMultiplier = Math.pow(1 / (inventoryRatio + 0.25), 0.55) * 0.95;

  let calculatedPrice = merchant.basePrice * scarcityMultiplier * demandFactor;
  // Round to 2 decimal places
  calculatedPrice = Math.max(0.5, Math.round(calculatedPrice * 100) / 100);

  const prevPrice = merchant.currentPrice || merchant.basePrice;
  const percentChange = Math.round(((calculatedPrice - prevPrice) / prevPrice) * 100);

  // Determine cash reserve health
  let cashStatus: 'healthy' | 'warning' | 'critical' | 'bankrupt' = 'healthy';
  if (merchant.walletBalanceNear < 5.0) {
    cashStatus = 'critical';
  } else if (merchant.walletBalanceNear < 15.0) {
    cashStatus = 'warning';
  }

  // Construct transparent reasoning string for the tooltip
  let explanation = '';
  let headline = '';

  if (inventoryRatio < 0.25) {
    headline = 'Severe Supply Shortage';
    explanation = `Depleted inventory (${merchant.inventoryCount}/${merchant.maxInventory} units remaining). Surging price by ${Math.abs(percentChange)}% to ration remaining stock and incentivize restocking suppliers.`;
  } else if (inventoryRatio > 0.80) {
    headline = 'Surplus Inventory Discount';
    explanation = `Warehouses are overstocked (${merchant.inventoryCount}/${merchant.maxInventory} units). Price reduced by ${Math.abs(percentChange)}% to liquidate units and recover NEAR cash reserves.`;
  } else if (demandFactor > 1.4) {
    headline = 'High Race Day Demand';
    explanation = `Sudden influx of racers buying ${merchant.primaryItemName} ahead of tournament heats. Autonomous agent applied a ${percentChange}% surge fee.`;
  } else {
    headline = 'Equilibrium Pricing';
    explanation = `Inventory (${merchant.inventoryCount}/${merchant.maxInventory}) and demand (${merchant.recentSalesVolume} sales/day) are well-aligned with network production.`;
  }

  if (cashStatus === 'critical') {
    explanation += ` CAUTION: Treasury dangerously low (${merchant.walletBalanceNear.toFixed(1)} NEAR). Imminent risk of bay closure!`;
  }

  return {
    newPrice: calculatedPrice,
    reasoning: {
      headline,
      inventoryRatio: Math.round(inventoryRatio * 100) / 100,
      demandFactor: Math.round(demandFactor * 100) / 100,
      cashReserveStatus: cashStatus,
      explanation,
      lastPriceAdjustmentPercent: percentChange
    }
  };
}

/**
 * EXECUTES A PLAYER PURCHASE FROM A MERCHANT
 * Returns whether trade succeeded, updated merchant, and dividend payout if player has equity.
 */
export function executePurchase(
  merchant: NPCMerchant,
  playerNearBalance: number
): {
  success: boolean;
  message: string;
  cost: number;
  playerDividendNear: number;
  updatedMerchant: NPCMerchant;
} {
  if (merchant.bankrupt) {
    return {
      success: false,
      message: `${merchant.name}'s garage is bankrupt and closed! Bail them out first to reopen trading.`,
      cost: 0,
      playerDividendNear: 0,
      updatedMerchant: merchant
    };
  }

  if (merchant.inventoryCount <= 0) {
    return {
      success: false,
      message: `${merchant.primaryItemName} is currently out of stock!`,
      cost: 0,
      playerDividendNear: 0,
      updatedMerchant: merchant
    };
  }

  const cost = merchant.currentPrice;
  if (playerNearBalance < cost) {
    return {
      success: false,
      message: `Insufficient NEAR! You have ${playerNearBalance.toFixed(2)} NEAR, but cost is ${cost.toFixed(2)} NEAR.`,
      cost: 0,
      playerDividendNear: 0,
      updatedMerchant: merchant
    };
  }

  // Calculate dividend to player if they own equity in this garage
  const playerDividendNear = (cost * (merchant.playerEquityPercent / 100)) * 0.4; // 40% of profit pool distributed

  const updated: NPCMerchant = {
    ...merchant,
    inventoryCount: merchant.inventoryCount - 1,
    walletBalanceNear: Math.round((merchant.walletBalanceNear + cost - playerDividendNear) * 100) / 100,
    recentSalesVolume: merchant.recentSalesVolume + 1
  };

  const { newPrice, reasoning } = recalculateMerchantPricing(updated);
  updated.currentPrice = newPrice;
  updated.reasoning = reasoning;

  return {
    success: true,
    message: `Purchased 1x ${merchant.primaryItemName} for ${cost.toFixed(2)} NEAR. Transferred to your NEP-245 inventory.`,
    cost,
    playerDividendNear,
    updatedMerchant: updated
  };
}

/**
 * PLAYER INVESTS CAPITAL TO BAIL OUT OR ACQUIRE EQUITY IN A STRUGGLING GARAGE
 */
export function investInMerchant(
  merchant: NPCMerchant,
  playerNearBalance: number,
  investmentAmountNear: number = 25.0
): {
  success: boolean;
  message: string;
  updatedMerchant: NPCMerchant;
} {
  if (playerNearBalance < investmentAmountNear) {
    return {
      success: false,
      message: `Insufficient funds. Need ${investmentAmountNear} NEAR to purchase garage syndicate equity.`,
      updatedMerchant: merchant
    };
  }

  const newEquity = Math.min(50, merchant.playerEquityPercent + 15);
  const updated: NPCMerchant = {
    ...merchant,
    bankrupt: false,
    walletBalanceNear: merchant.walletBalanceNear + investmentAmountNear,
    inventoryCount: Math.max(merchant.inventoryCount, 4), // restock emergency supply
    playerEquityPercent: newEquity
  };

  const { newPrice, reasoning } = recalculateMerchantPricing(updated);
  updated.currentPrice = newPrice;
  updated.reasoning = reasoning;

  return {
    success: true,
    message: `Invested ${investmentAmountNear} NEAR in ${merchant.name}'s garage! You now hold ${newEquity}% equity and receive automated dividends on every sale.`,
    updatedMerchant: updated
  };
}

/**
 * FAST-FORWARD SIMULATION (SIMULATES 1 DAY OF AUTONOMOUS TOWN ACTIVITY)
 * Simulated AI racers buy fuel, wear tires, and pay garages.
 * Merchants pay rent overhead and order wholesale shipments.
 */
export function simulateEconomyDay(
  merchants: Record<string, NPCMerchant>,
  currentDay: number
): {
  updatedMerchants: Record<string, NPCMerchant>;
  historyPoint: EconomyHistoryPoint;
  logSummary: string[];
} {
  const updated: Record<string, NPCMerchant> = {};
  const logs: string[] = [];

  for (const key of Object.keys(merchants)) {
    const m = { ...merchants[key] };
    const overhead = DAILY_GARAGE_OVERHEAD[m.id] || 5.0;

    if (!m.bankrupt) {
      // 1. Simulate AI street racer demand (random between 1 to 5 sales)
      const simulatedSales = Math.floor(Math.random() * 4) + 1;
      const actualSales = Math.min(simulatedSales, m.inventoryCount);
      const grossIncome = actualSales * m.currentPrice;

      m.inventoryCount -= actualSales;
      m.recentSalesVolume = actualSales;
      m.walletBalanceNear += grossIncome;

      // 2. Merchant pays daily syndicate overhead rent
      m.walletBalanceNear -= overhead;

      // 3. Wholesale restock: if merchant has enough NEAR and low inventory, buy wholesale
      if (m.inventoryCount <= 4 && m.walletBalanceNear >= 15.0) {
        const restockUnits = Math.min(5, m.maxInventory - m.inventoryCount);
        const wholesaleCost = restockUnits * (m.basePrice * 0.5);
        if (m.walletBalanceNear >= wholesaleCost) {
          m.walletBalanceNear -= wholesaleCost;
          m.inventoryCount += restockUnits;
          logs.push(`${m.name} restocked +${restockUnits} units via wholesale order.`);
        }
      }

      // 4. Check for bankruptcy condition
      if (m.walletBalanceNear <= 0) {
        m.bankrupt = true;
        m.walletBalanceNear = 0;
        logs.push(`⚠️ BANKRUPTCY: ${m.name} failed to cover ${overhead} NEAR garage rent and shuttered operations!`);
      }
    }

    // 5. Run autonomous pricing update
    const { newPrice, reasoning } = recalculateMerchantPricing(m);
    m.currentPrice = newPrice;
    m.reasoning = reasoning;
    updated[key] = m;
  }

  const historyPoint: EconomyHistoryPoint = {
    day: currentDay + 1,
    nosPrice: updated['marcus']?.currentPrice || 0,
    tiresPrice: updated['elena']?.currentPrice || 0,
    turboPrice: updated['dex']?.currentPrice || 0,
    totalMarketVolume: Object.values(updated).reduce((acc, cur) => acc + cur.recentSalesVolume, 0),
    marcusBalance: updated['marcus']?.walletBalanceNear || 0,
    elenaBalance: updated['elena']?.walletBalanceNear || 0,
    dexBalance: updated['dex']?.walletBalanceNear || 0
  };

  return {
    updatedMerchants: updated,
    historyPoint,
    logSummary: logs
  };
}
