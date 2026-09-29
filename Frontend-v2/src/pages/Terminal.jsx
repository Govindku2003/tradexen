import MarketTicker from "../components/terminal/MarketTicker";
import Watchlist from "../components/terminal/Watchlist";
import ChartPanel from "../components/terminal/ChartPanel";
import OrderTicket from "../components/terminal/OrderTicket";
import TradingDock from "../components/terminal/TradingDock";
import MarketIntelligence from "../components/terminal/MarketIntelligence";

function Terminal() {
  return (
    <section>
      <MarketTicker />

      <div className="grid gap-3 xl:grid-cols-[250px_minmax(0,1fr)_285px]">
        <Watchlist />

        <ChartPanel />

        <OrderTicket />
      </div>

      <TradingDock />

      <MarketIntelligence />
    </section>
  );
}

export default Terminal;