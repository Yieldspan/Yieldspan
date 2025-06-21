#![cfg(test)]

use soroban_sdk::{
    testutils::{Address as _},
    Address, Env,
};

use crate::{YieldVault, YieldVaultClient};

fn setup<'a>() -> (Env, YieldVaultClient<'a>, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register::<YieldVault, ()>(YieldVault {}, ());
    let client = YieldVaultClient::new(&env, &contract_id);
    let user = Address::generate(&env);

    (env, client, user)
}

#[test]
fn test_deposit_and_balance() {
    let (_env, client, user) = setup();

    client.deposit(&user, &600);
    let balance = client.balance_of(&user);
    assert_eq!(balance, 600);
}

#[test]
fn test_multiple_deposits() {
    let (_env, client, user) = setup();

    client.deposit(&user, &300);
    client.deposit(&user, &200);
    let balance = client.balance_of(&user);
    assert_eq!(balance, 500);
}

#[test]
fn test_empty_balance() {
    let (_env, client, user) = setup();

    let balance = client.balance_of(&user);
    assert_eq!(balance, 0);
}
