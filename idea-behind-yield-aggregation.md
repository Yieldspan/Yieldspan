# Idea Behind Yield Aggregation

## 1. Enumerate All Available Yield Sources

First, make a catalog of every protocol where ETH (or bridged assets) can earn yield:

| Category                 | Protocol / Platform  | Asset         | Expected APY             | Risk Notes                  |
| ------------------------ | -------------------- | ------------- | ------------------------ | --------------------------- |
| **Ethereum Staking**     | Lido                 | stETH         | \~4 – 6 %                | Smart-contract risk; liquid |
|                          | Rocket Pool          | rETH          | \~3 – 5 %                | Smaller node operators      |
| **Lending Markets**      | Aave                 | ETH           | \~3 – 6 %                | Liquid; protocol risk       |
|                          | Compound             | ETH           | \~3 – 5 %                |                             |
| **Vaults / Aggregators** | Yearn Vaults (yvETH) | ETH           | \~5 – 8 %                | Auto-compounding; fee layer |
| **Stellar Anchors**      | Anchor USDC Savings  | USDC (on XLM) | \~6 – 8 %                | Centralized custodial       |
|                          | XLM staking          | XLM           | \~1 – 2 %                | Low yield, low risk         |
| **Cross-Chain Pools**    | Curve (stETH/ETH)    | ETH–stETH LP  | \~2 – 4 % + trading fees | Impermanent loss risk       |

> 🔍 You’ll need to maintain an up-to-date feed of each source’s APY (via subgraph, REST API, etc.) and metadata (e.g. min lock-up, withdrawal fees, trust assumptions).

---

## 2. Define Our Optimization Problem

We want to choose allocations $x_i$ (fractions summing to 1) across N sources to **maximize total yield**, subject to whatever constraints we impose:

$$
\begin{aligned}
&\max_{x} && \sum_{i=1}^N \big(\text{APY}_i \times x_i\big) \\
&\text{s.t.} 
  && \sum_{i=1}^N x_i = 1, \\
& && x_i \ge 0 \quad \forall i, \\
& && x_i \le M_i \quad (\text{max per source}), \\
& && x_i \ge m_i \quad (\text{min per source, for diversification}).
\end{aligned}
$$

* $M_i$ lets us cap exposure (e.g. “no more than 30 % in any single protocol”).
* $m_i$ lets us enforce minimal diversification (e.g. “at least 5 % in Aave”).

Now we solve this with any LP solver (e.g. [PuLP](https://coin-or.github.io/pulp/) in Python) or even a simple greedy heuristic.

---

## 3. Example: Greedy “Cap & Fill” Heuristic

If we don’t want to pull in a full LP solver, we can:

1. **Sort** sources by descending APY.
2. **Iterate** through sorted list, and:

   * Allocate $x_i = \min\big(M_i,\;1 - \sum_{j<i} x_j\big)$.
3. **Post-check**: if total < 1 because of caps, redistribute the remainder proportionally across sources that haven’t hit their cap.

```python
def greedy_alloc(apys, caps):
    """
    apys: list of (protocol, apy) tuples, sorted desc by apy
    caps: dict protocol -> max fraction (M_i)
    returns dict protocol -> allocation x_i
    """
    alloc = {p: 0 for p, _ in apys}
    remaining = 1.0

    for protocol, apy in apys:
        cap = caps.get(protocol, 1.0)
        take = min(cap, remaining)
        alloc[protocol] = take
        remaining -= take
        if remaining <= 1e-8:
            break

    # If leftover > 0, redistribute among non-capped
    if remaining > 1e-8:
        noncapped = [p for p, _ in apys if alloc[p] < caps.get(p,1.0)]
        for p in noncapped:
            extra_cap = caps.get(p,1.0) - alloc[p]
            add = min(extra_cap, remaining / len(noncapped))
            alloc[p] += add
            remaining -= add
            if remaining <= 1e-8:
                break

    return alloc
```

You’d call it like:

```python
apys = [
  ("Lido", 0.055),
  ("Yearn", 0.065),
  ("Aave", 0.045),
  ("Anchor-USDC", 0.075),
  # …
]
# Cap any one protocol to at most 30%
caps = {p: 0.30 for p, _ in apys}

allocation = greedy_alloc(apys, caps)
print(allocation)
```

---

## 4. Bringing in Risk & Fees

If we want to factor in:

* **Risk score** $r_i$ (higher = riskier),
* **Bridge or withdrawal fees** $f_i$,

we can simply adjust our objective to a **net-score**:

$$
\text{Score}_i = \text{APY}_i - \lambda_r\,r_i - \lambda_f\,f_i,
$$

and then run the same LP/greedy on **Score$_i$** instead of raw APY.

---

## 5. Dynamic Rebalancing

* Run this allocation routine on a schedule (e.g. every hour/day).
* If allocations drift beyond some threshold (say ±5 %), trigger a rebalance transaction.
* Factor gas costs into our net-score so we don’t rebalance too often.

---

## 6. Putting It All Together

1. **Fetch** real-time APYs, risk scores, fees.
2. **Compute** allocations via LP or greedy.
3. **Generate** a set of on-chain transactions:

   * Bridge assets (ETH → stETH, ETH → USDC-on-Stellar)
   * Deposit into chosen protocols
4. **Monitor** and **rebalance** as yields change.
