#!/usr/bin/env node

import axios from 'axios';
import chalk from 'chalk';
import { table } from 'table';
import fs from 'fs';
import path from 'path';

const cryptos = ['bitcoin', 'ethereum', 'cardano', 'solana', 'polkadot', 'ripple', 'litecoin', 'dogecoin', 'tron', 'chainlink', 'uniswap', 'avalanche-2', 'polygon', 'optimism', 'arbitrum'];
const updateInterval = 2 * 60 * 1000; // 2 minutes
const csvFile = 'crypto_history.csv';
const alertsFile = 'alerts.json';

let priceHistory = {};
let alerts = {};

function loadAlerts() {
  if (fs.existsSync(alertsFile)) {
    alerts = JSON.parse(fs.readFileSync(alertsFile, 'utf8'));
  }
}

function saveAlerts() {
  fs.writeFileSync(alertsFile, JSON.stringify(alerts, null, 2));
}

function loadHistory() {
  if (fs.existsSync(csvFile)) {
    const lines = fs.readFileSync(csvFile, 'utf8').split('\n');
    if (lines.length > 1) {
      for (const line of lines.slice(1)) {
        if (line.trim()) {
          const [crypto, price, timestamp] = line.split(',');
          if (!priceHistory[crypto]) priceHistory[crypto] = [];
          priceHistory[crypto].push({ price: parseFloat(price), timestamp });
        }
      }
    }
  }
}

function saveHistory(prices) {
  const fileExists = fs.existsSync(csvFile);
  if (!fileExists) {
    fs.writeFileSync(csvFile, 'Crypto,Price,Timestamp\n');
  }
  
  const timestamp = new Date().toISOString();
  for (const [crypto, data] of Object.entries(prices)) {
    fs.appendFileSync(csvFile, `${crypto},${data.price},${timestamp}\n`);
  }
}

function checkAlerts(prices) {
  for (const [crypto, alert] of Object.entries(alerts)) {
    if (prices[crypto]) {
      const price = prices[crypto].price;
      if (alert.type === 'above' && price >= alert.target) {
        console.log(chalk.bgGreen.black(`🚨 ALERT: ${crypto.toUpperCase()} hit $${price.toFixed(2)} (target: $${alert.target})`));
      } else if (alert.type === 'below' && price <= alert.target) {
        console.log(chalk.bgRed.white(`🚨 ALERT: ${crypto.toUpperCase()} dropped to $${price.toFixed(2)} (target: $${alert.target})`));
      }
    }
  }
}

async function fetchPrices() {
  try {
    console.clear();
    console.log(chalk.cyan('\n🚀 Fetching crypto prices...\n'));

    const ids = cryptos.join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`;

    const response = await axios.get(url);
    const data = response.data;
    const prices = {};

    const tableData = [
      [chalk.bold('Crypto'), chalk.bold('Price'), chalk.bold('24h Change'), chalk.bold('Market Cap')]
    ];

    for (const crypto of cryptos) {
      if (data[crypto]) {
        const price = data[crypto].usd;
        const change = data[crypto].usd_24h_change;
        const marketCap = data[crypto].usd_market_cap;

        prices[crypto] = { price, change, marketCap };

        const changeColor = change >= 0 ? chalk.green : chalk.red;
        const changeStr = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;

        tableData.push([
          chalk.yellow(crypto.toUpperCase()),
          chalk.white(`$${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`),
          changeColor(changeStr),
          chalk.gray(`$${(marketCap / 1e9).toFixed(2)}B`)
        ]);
      }
    }

    console.log(table(tableData));
    checkAlerts(prices);
    saveHistory(prices);
    console.log(chalk.gray('Last updated: ' + new Date().toLocaleTimeString()));
    console.log(chalk.gray(`Next update in 2 minutes...`));
    console.log();

  } catch (error) {
    console.error(chalk.red('❌ Error fetching prices:'), error.message);
  }
}

function setAlert(crypto, type, price) {
  if (!alerts[crypto]) alerts[crypto] = {};
  alerts[crypto] = { type, target: price };
  saveAlerts();
  console.log(chalk.green(`✅ Alert set: ${crypto.toUpperCase()} if price goes ${type} $${price}`));
}

function showHelp() {
  console.log(chalk.cyan('\n📖 Commands:'));
  console.log('  alert-above <crypto> <price>  - Alert when crypto goes above price');
  console.log('  alert-below <crypto> <price>  - Alert when crypto goes below price');
  console.log('  show-history <crypto>         - Show price history for crypto');
  console.log('  list-cryptos                  - Show tracked cryptocurrencies\n');
}

async function main() {
  loadAlerts();
  loadHistory();

  const args = process.argv.slice(2);

  if (args[0] === 'alert-above' && args[1] && args[2]) {
    setAlert(args[1], 'above', parseFloat(args[2]));
  } else if (args[0] === 'alert-below' && args[1] && args[2]) {
    setAlert(args[1], 'below', parseFloat(args[2]));
  } else if (args[0] === 'show-history' && args[1]) {
    const crypto = args[1];
    if (priceHistory[crypto]) {
      console.log(chalk.cyan(`\n📊 Price history for ${crypto.toUpperCase()}:`));
      priceHistory[crypto].slice(-10).forEach((entry, i) => {
        console.log(`  ${i + 1}. $${entry.price.toFixed(2)} at ${entry.timestamp}`);
      });
    } else {
      console.log(chalk.yellow('No history found for this crypto yet.'));
    }
  } else if (args[0] === 'list-cryptos') {
    console.log(chalk.cyan('\n📋 Tracked cryptocurrencies:'));
    cryptos.forEach((c, i) => console.log(`  ${i + 1}. ${c.toUpperCase()}`));
  } else if (args[0] === 'help') {
    showHelp();
  } else {
    await fetchPrices();
    setInterval(fetchPrices, updateInterval);
  }
}

main();
