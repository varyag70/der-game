# Money Units in the Game

## Internal storage
- **All monetary values** (positions, prices, transactions) are stored in **`RUB_BASE`**.
- `RUB_BASE` is an **integer unit** — no floats inside the system.

## Current scale
- Today:  
  \[
  \text{RUB} = \text{RUB\_BASE} \times 100
  \]
- Meaning: `RUB_BASE = 1/100` of a ruble (= 1 kopek).  
- Example: `positions["RUB"] = 123456` → 1 234.56 ₽.

## Possible future change
- If finer precision is needed, scale can change, e.g.  
  \[
  \text{RUB} = \text{RUB\_BASE} \times 10\,000
  \]
- Then `RUB_BASE = 1/10 000` of a ruble.

## Prices
- All prices (e.g. USD/RUB) are stored in `RUB_BASE` per unit of asset.
- Example: USD = 101.02 ₽ → `priceSnapshot.prices_all["USD"] = 10102`.

## Display
- For tables and UI, RUB is shown as **rubles with 2 decimals** (friendly).  
- Format: `formatRubK(kopeks)` → `"1234.56"`.  
- Advanced screens (audit, settlements) may show more decimals if scale changes in the future.

## Validators
- All validation logic operates in integers of `RUB_BASE`.
- No rounding is done in validators — only at display boundaries.

## Migration policy
- If `RUB_SCALE` changes (100 → 10 000), multiply all stored RUB amounts and RUB-denominated prices by the ratio (e.g. ×100).  
- Bump a version number (e.g. `moneyVersion`) to mark the change.
