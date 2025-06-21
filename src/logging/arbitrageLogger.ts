import fs from 'fs';
import path from 'path';
import { ArbitrageResult } from '../arbitrage/simulateArbitrage';

const LOGS_DIR = path.resolve(__dirname, '../../logs');

export const logArbitrageResult = (result: ArbitrageResult, pairName: string) => {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }

  const logFilePath = path.join(LOGS_DIR, `${pairName.toUpperCase()}-arbitrage-log.json`);

  const timestamp = new Date().toISOString();

  const entry = {
    timestamp,
    bestSource: result.bestSource,
    bestPrice: result.bestPrice,
    worstSource: result.worstSource,
    worstPrice: result.worstPrice,
    spreadPercentage: result.spreadPercentage,
    simulatedProfit: result.simulatedProfit,
    baseAmount: result.baseAmount
  };

  let logs = [];
  if (fs.existsSync(logFilePath)) {
    const raw = fs.readFileSync(logFilePath, 'utf-8');
    try {
      logs = JSON.parse(raw);
    } catch (err) {
      console.error('❗ Error parsing existing log file, overwriting...');
    }
  }

  logs.push(entry);

  fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2));
  console.log(`📝 Logged arbitrage opportunity to ${logFilePath}`);
};
