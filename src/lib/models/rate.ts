export class CurrencyRate {
  private rates: Record<string, number> = {};
  lastModified: Date;
  baseCurrency: string = "cny";

  constructor(baseCurrency: string, initialRates: Record<string, number>) {
    this.baseCurrency = baseCurrency;
    this.rates = initialRates;
    this.lastModified = new Date();
  }

  getRate(currency: string): number | undefined {
    return this.rates[currency];
  }

  setRate(currency: string, rate: number): void {
    this.rates[currency] = rate;
  }

  getAllRates(): Record<string, number> {
    return this.rates;
  }
}
