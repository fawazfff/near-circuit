/*!
 * NEAR CIRCUIT - NEP-245 MULTI-TOKEN CONTRACT IMPLEMENTATION
 * 
 * Standard NEP-245 Multi-Token contract for NEAR Circuit: Underground Economy.
 * Stores player consumables (NOS, tire sets), mechanical upgrades (turbos),
 * and syndicate shop royalty shares under one unified on-chain storage contract.
 */

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedMap};
use near_sdk::json_types::U128;
use near_sdk::{env, near_bindgen, AccountId, PanicOnDefault, Promise, PromiseOrValue};
use serde::{Deserialize, Serialize};

pub type TokenId = String;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct TokenMetadata {
    pub title: Option<String>,
    pub description: Option<String>,
    pub media: Option<String>,
    pub category: String, // "consumable" | "upgrade" | "syndicate_share"
    pub max_supply: Option<u64>,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct NearCircuitNEP245 {
    pub owner_id: AccountId,
    /// Maps TokenId -> TokenMetadata
    pub token_metadata: UnorderedMap<TokenId, TokenMetadata>,
    /// Nested map: (AccountId, TokenId) -> Balance
    pub balances: LookupMap<(AccountId, TokenId), u128>,
    /// Authorized game session key relayers
    pub session_relayers: LookupMap<AccountId, bool>,
}

#[near_bindgen]
impl NearCircuitNEP245 {
    #[init]
    pub fn new(owner_id: AccountId) -> Self {
        require!(!env::state_exists(), "Already initialized");
        Self {
            owner_id,
            token_metadata: UnorderedMap::new(b"m".to_vec()),
            balances: LookupMap::new(b"b".to_vec()),
            session_relayers: LookupMap::new(b"r".to_vec()),
        }
    }

    /// Query the balance of a specific NEP-245 token for an account
    pub fn mt_balance_of(&self, account_id: AccountId, token_id: TokenId) -> U128 {
        self.balances.get(&(account_id, token_id)).unwrap_or(0).into()
    }

    /// Batch query token balances
    pub fn mt_batch_balance_of(&self, account_id: AccountId, token_ids: Vec<TokenId>) -> Vec<U128> {
        token_ids
            .into_iter()
            .map(|t| self.balances.get(&(account_id.clone(), t)).unwrap_or(0).into())
            .collect()
    }

    /// Transfer NEP-245 tokens (Function-call session key accessible)
    pub fn mt_transfer(
        &mut self,
        receiver_id: AccountId,
        token_id: TokenId,
        amount: U128,
        approval_id: Option<u64>,
        memo: Option<String>,
    ) {
        let sender_id = env::predecessor_account_id();
        let amount_raw: u128 = amount.into();
        
        let sender_key = (sender_id.clone(), token_id.clone());
        let sender_bal = self.balances.get(&sender_key).unwrap_or(0);
        require!(sender_bal >= amount_raw, "Insufficient token balance");

        // Deduct sender balance
        self.balances.insert(&sender_key, &(sender_bal - amount_raw));

        // Credit receiver balance
        let receiver_key = (receiver_id.clone(), token_id.clone());
        let receiver_bal = self.balances.get(&receiver_key).unwrap_or(0);
        self.balances.insert(&receiver_key, &(receiver_bal + amount_raw));

        env::log_str(&format!(
            "NEP245: Transferred {} units of {} from {} to {}",
            amount_raw, token_id, sender_id, receiver_id
        ));
    }

    /// Mint tokens (Called by game engine or race rewards via relayer)
    pub fn mt_mint(&mut self, receiver_id: AccountId, token_id: TokenId, amount: U128) {
        let caller = env::predecessor_account_id();
        require!(
            caller == self.owner_id || self.session_relayers.get(&caller).unwrap_or(false),
            "Only owner or authorized game relayer can mint"
        );

        let amount_raw: u128 = amount.into();
        let key = (receiver_id.clone(), token_id.clone());
        let current = self.balances.get(&key).unwrap_or(0);
        self.balances.insert(&key, &(current + amount_raw));
    }

    /// Register a new item in the game catalog
    pub fn register_item(&mut self, token_id: TokenId, metadata: TokenMetadata) {
        require!(env::predecessor_account_id() == self.owner_id, "Owner only");
        self.token_metadata.insert(&token_id, &metadata);
    }
}
