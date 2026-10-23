import { NextResponse } from "next/server";

export async function GET() {
  const baseTickers = [
    { symbol: "NIFTY_50", name: "NIFTY 50", basePrice: 22600.0 },
    { symbol: "SENSEX", name: "SENSEX 30", basePrice: 73123.85 },
    { symbol: "BANK_NIFTY", name: "BANK NIFTY", basePrice: 54287.35 },
    { symbol: "NIFTY_IT", name: "NIFTY IT", basePrice: 34820.5 },
    { symbol: "USD_INR", name: "USD / INR", basePrice: 94.93 },
    { symbol: "NIFTY_AUTO", name: "NIFTY AUTO", basePrice: 22340.1 },
    { symbol: "GOLD_MCX", name: "MCX GOLD (10g)", basePrice: 71850.0 },
  ];

  const tickers = baseTickers.map((t) => {
    // Add small random realistic fluctuation
    const fluctuationPercent = (Math.random() - 0.48) * 0.8;
    const change = Number((t.basePrice * (fluctuationPercent / 100)).toFixed(2));
    const price = Number((t.basePrice + change).toFixed(2));
    return {
      symbol: t.symbol,
      name: t.name,
      price,
      change,
      changePercent: Number(fluctuationPercent.toFixed(2)),
      currency: "INR",
      lastUpdated: new Date().toISOString(),
    };
  });

  return NextResponse.json({
    tickers,
    timestamp: Date.now(),
  });
}

