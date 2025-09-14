<script lang="ts">
  import { positions } from '$lib/positions.svelte';
  import { priceSnapshot } from '$lib/prices/priceSnapshot.svelte';

  // --- Local class (scoped to this component) ---
  type Positions = Record<string, number>;
  type PricesAll = Record<string, number>;

  class Validator {
    constructor(private positions: Positions, private prices: PricesAll | null) {}

    setState(positions: Positions, prices: PricesAll | null) {
      this.positions = positions;
      this.prices = prices;
    }

    USD(dx: number): boolean {
      if (!this.prices) return false;
      const usdPrice   = this.prices['USD'] ?? 0;
      const rubBalance = this.positions['RUB'] ?? 0; // cash
      const usdBalance = this.positions['USD'] ?? 0;

      const dv = dx * usdPrice;

      // 1) cannot sell more USD than you have
      // 2) need enough RUB to fund purchase
      return dx >= -usdBalance && rubBalance - dv >= 0;
    }

    // dummies for now
    BOND(_dx: number): boolean { return true; }
    FORWARD(_dx: number): boolean { return true; }

    validate(asset: 'USD' | 'BOND' | 'FORWARD', dx: number): boolean {
      switch (asset) {
        case 'USD':     return this.USD(dx);
        case 'BOND':    return this.BOND(dx);
        case 'FORWARD': return this.FORWARD(dx);
      }
    }
  }

  // Single instance, kept in sync with runes
  let validator = $state(new Validator(positions, priceSnapshot.prices_all));
  $effect(() => {
    validator.setState(positions, priceSnapshot.prices_all);
  });

  // Example local usage
  let dx = $state(0);
  const ASSET: 'USD' | 'BOND' | 'FORWARD' = 'USD';

  function onCheck() {
    const ok = validator.validate(ASSET, dx);
    console.log(ok ? '✅ allowed' : '❌ denied');
  }
</script>

<input type="number" bind:value={dx} />
<button on:click={onCheck}>Check</button>
