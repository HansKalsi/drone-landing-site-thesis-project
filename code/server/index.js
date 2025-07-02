import express from 'express';
import fetch from 'node-fetch';

const app  = express();
const PORT = process.env.PORT      ?? 3001;                 // proxy port
const BASE = process.env.LLM_BASE  ?? 'http://127.0.0.1:1234/v1';
const KEY  = process.env.LLM_KEY   ?? '';                   // only for cloud later

app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const rsp = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(KEY && { Authorization: `Bearer ${KEY}` })
    },
    body: JSON.stringify(req.body)
  });
  res.status(rsp.status).json(await rsp.json());
});

app.listen(PORT, () =>
  console.log(`🚀 Proxy ready on http://localhost:${PORT}/api/chat`)
);
