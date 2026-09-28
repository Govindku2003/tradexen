class Strategy {
  constructor(name) {
    this.name = name;
  }

  generateSignal(marketData, indicators) {
    throw new Error(
      "generateSignal() must be implemented by the strategy"
    );
  }
}

export default Strategy;