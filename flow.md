# User Flow

- F: for frontend and user interactions
- B: for backend

With the current state, is it possible to achieve the following:

1. F1. Person deposits ETH, USDC or USDT on Ethereum and selects holding period time (1 week, 4 weeks, 6 months, 1 year, etc.)
2. B1. WE MUST RUN AN ACTUAL ALGO here to select in which ratios we will split the capital the person deposits across different yield mechanisms. (which mechanisms can be used? here are our initial ideas: staking reward from stETH, deposit some to Aave, etc)
3. B2. Make some TX bullshit here to get the user's deposit on Ethereum
4. F2. \*simulate time passing here\*
5. F3. \*person can see the holdings, projection of earnings per passing time unit (week?)\*
6. F4. Person can claim earnings at any given time, or withdraw all
7. B2. Make some TX bullshit here to give the user something on Stellar