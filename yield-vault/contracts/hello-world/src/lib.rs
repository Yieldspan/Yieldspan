#![no_std]

use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol, Map};

const BALANCES: Symbol = symbol_short!("balances");
const STRATEGIES: Symbol = symbol_short!("strategy"); 
const ARBITRAGE_LOGS: Symbol = symbol_short!("arb_logs");

const STRATEGY_CONSERVATIVE: Symbol = symbol_short!("conserv");
const STRATEGY_BALANCED: Symbol = symbol_short!("balanced");
const STRATEGY_AGGRESSIVE: Symbol = symbol_short!("aggress");

#[derive(Clone)]
pub struct ArbitrageLog {
    pub spread_percentage: i128,
    pub profit: i128,
}

#[contract]
pub struct YieldVault;

#[contractimpl]
impl YieldVault {
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

    pub fn balance_of(env: Env, user: Address) -> i128 {
        let balances: Map<Address, i128> = env
            .storage()
            .persistent()
            .get(&BALANCES)
            .unwrap_or_else(|| Map::new(&env));

        balances.get(user).unwrap_or(0)
    }

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

    pub fn set_strategy(env: Env, user: Address, strategy: Symbol) {
        user.require_auth();

        let mut strategies: Map<Address, Symbol> = env
            .storage()
            .persistent()
            .get(&STRATEGIES)
            .unwrap_or_else(|| Map::new(&env));

        strategies.set(user.clone(), strategy);
        env.storage().persistent().set(&STRATEGIES, &strategies);
    }

    pub fn get_strategy(env: Env, user: Address) -> Symbol {
        let strategies: Map<Address, Symbol> = env
            .storage()
            .persistent()
            .get(&STRATEGIES)
            .unwrap_or_else(|| Map::new(&env));

        strategies.get(user).unwrap_or(symbol_short!("none"))
    }

    pub fn select_strategy(_env: Env, spread_percentage: i128) -> Symbol {
        if spread_percentage < 20 {
            STRATEGY_CONSERVATIVE
        } else if spread_percentage < 50 {
            STRATEGY_BALANCED
        } else {
            STRATEGY_AGGRESSIVE
        }
    }

    pub fn log_arbitrage_opportunity(env: Env, id: Symbol, spread_percentage: i128, profit: i128) {
        let mut logs: Map<Symbol, (i128, i128)> = env
            .storage()
            .persistent()
            .get(&ARBITRAGE_LOGS)
            .unwrap_or_else(|| Map::new(&env));

        logs.set(id, (spread_percentage, profit));
        env.storage().persistent().set(&ARBITRAGE_LOGS, &logs);
    }

    pub fn get_arbitrage_log(env: Env, id: Symbol) -> (i128, i128) {
        let logs: Map<Symbol, (i128, i128)> = env
            .storage()
            .persistent()
            .get(&ARBITRAGE_LOGS)
            .unwrap_or_else(|| Map::new(&env));

        logs.get(id).unwrap_or((0, 0))
    }
}
