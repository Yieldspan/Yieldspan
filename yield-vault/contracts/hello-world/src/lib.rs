#![no_std]

use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol, Map};

const BALANCES: Symbol = symbol_short!("balances");
const STRATEGIES: Symbol = symbol_short!("strategy"); // Yeni: strateji depolama

#[contract]
pub struct YieldVault;

#[contractimpl]
impl YieldVault {
    // 💰 Token yatırma
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

    // 💸 Token çekme
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

    // 👀 Kullanıcı bakiyesi görüntüleme
    pub fn balance_of(env: Env, user: Address) -> i128 {
        let balances: Map<Address, i128> = env
            .storage()
            .persistent()
            .get(&BALANCES)
            .unwrap_or_else(|| Map::new(&env));

        balances.get(user).unwrap_or(0)
    }

    // 📊 Vault toplamı
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

    // 🎁 Ödül ekleme (auth gerekmez, backend çağırır)
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

    // 🧠 Kullanıcının stratejisini belirleme
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

    // 🧾 Kullanıcının stratejisini görüntüleme
    pub fn get_strategy(env: Env, user: Address) -> Symbol {
        let strategies: Map<Address, Symbol> = env
            .storage()
            .persistent()
            .get(&STRATEGIES)
            .unwrap_or_else(|| Map::new(&env));

        strategies.get(user).unwrap_or(symbol_short!("none"))
    }
}
