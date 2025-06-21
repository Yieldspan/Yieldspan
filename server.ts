import express from 'express';
import cors from 'cors';
import { simulatePortfolio } from './src/portfolio/portfolioManager';

const app = express();
const PORT = 8787;

app.use(cors());
app.use(express.json());

app.post('/simulate', (req, res) => {
  const { user, investment, strategy } = req.body;

  if (!user || !investment || !strategy) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  simulatePortfolio(user, investment, strategy)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      console.error('Simulation error:', err);
      res.status(500).json({ error: 'Simulation failed' });
    });
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
