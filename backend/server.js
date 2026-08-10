require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const PORT = process.env.PORT || 5000;

function isValidEthAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

app.get('/api/balance', async (req, res) => {
  const { address } = req.query;
  if (!address || !isValidEthAddress(address)) {
    return res.status(400).json({ success: false, error: 'Invalid Ethereum address' });
  }

  try {
    const url = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=balance&address=${address}&apikey=${ETHERSCAN_API_KEY}`;
    const response = await axios.get(url);
    if (response.data.status !== '1' && response.data.message !== 'No transactions found') {
      return res.status(500).json({ success: false, error: response.data.message || 'Error fetching balance' });
    }
    const balanceWei = response.data.result;
    const balanceEth = balanceWei / 1e18;
    return res.json({ success: true, balance: balanceEth });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/transactions', async (req, res) => {
  const { address } = req.query;
  if (!address || !isValidEthAddress(address)) {
    return res.status(400).json({ success: false, error: 'Invalid Ethereum address' });
  }

  try {
    const url = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address=${address}&sort=desc&apikey=${ETHERSCAN_API_KEY}`;
    const response = await axios.get(url);
    if (response.data.status !== '1' && response.data.message !== 'No transactions found') {
      return res.status(500).json({ success: false, error: response.data.message || 'Error fetching transactions' });
    }
    const transactions = (response.data.result || []).slice(0, 10).map(tx => ({
      ...tx,
      eth_value: parseInt(tx.value) / 1e18
    }));
    return res.json({ success: true, transactions });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
