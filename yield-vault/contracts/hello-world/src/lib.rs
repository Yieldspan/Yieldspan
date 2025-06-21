#![no_std]

use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol, Map};

const BALANCES: Symbol = symbol_short!("balances");

#[contract]
pub struct YieldVault;

#[contractimpl]
impl YieldVault {
    // Deposit token into vault (manual)
    pub fn deposit(env: Env, user: Address, amount: i128) {
        user.require_auth();

        let mut balances: Map<Address, i128> = env
            .storage()
            .persistent()
            .get(&BALANCES)
            .unwrap_or_else(|| Map::new(&env));

        let current = balances.get(user.clone()).unwrap_or(0);
        balances.set(user.clone(), current + amount);
        env.storage().persistent().set(&BALANCES, &balances);
    }

    // Withdraw token from vault
    pub fn withdraw(env: Env, user: Address, amount: i128) {
        user.require_auth();

        let mut balances: Map<Address, i128> = env
            .storage()
            .persistent()
            .get(&BALANCES)
            .unwrap_or_else(|| Map::new(&env));

        let current = balances.get(user.clone()).unwrap_or(0);
        assert!(current >= amount, "insufficient balance");

        balances.set(user.clone(), current - amount);
        env.storage().persistent().set(&BALANCES, &balances);
    }

    // Check balance of a user
    pub fn balance_of(env: Env, user: Address) -> i128 {
        let balances: Map<Address, i128> = env
            .storage()
            .persistent()
            .get(&BALANCES)
            .unwrap_or_else(|| Map::new(&env));

        balances.get(user).unwrap_or(0)
    }

    // Total deposits in the vault
    pub fn total_deposits(env: Env) -> i128 {
        let balances: Map<Address, i128> = env
            .storage()
            .persistent()
            .get(&BALANCES)
            .unwrap_or_else(|| Map::new(&env));

        let mut total: i128 = 0;
        for (_, amount) in balances.iter() {
            total += amount;
        }
        total
    }

    // New: Reward user (no auth required)
    pub fn reward_user(env: Env, user: Address, reward_amount: i128) {
        let mut balances: Map<Address, i128> = env
            .storage()
            .persistent()
            .get(&BALANCES)
            .unwrap_or_else(|| Map::new(&env));

        let current = balances.get(user.clone()).unwrap_or(0);
        balances.set(user.clone(), current + reward_amount);
        env.storage().persistent().set(&BALANCES, &balances);
    }
}
