import express from 'express';
import cors from 'cors';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

const RESULTS_DIR = path.join(__dirname, 'data');
const RESULTS_FILE = path.join(RESULTS_DIR, 'results.json');

app.use(cors());
app.use(express.json());

// POST /webhook/results - receive results from agent
app.post('/webhook/results', async (req, res) => {
  try {
    const data = req.body;
    
    console.log('[Webhook] Received result:', {
      jobId: data.jobId,
      agentName: data.agentName,
      service: data.service,
      score: data.score
    });

    // Ensure data directory exists
    if (!existsSync(RESULTS_DIR)) {
      await mkdir(RESULTS_DIR, { recursive: true });
    }

    // Read existing results
    let results = [];
    if (existsSync(RESULTS_FILE)) {
      const content = await readFile(RESULTS_FILE, 'utf-8');
      results = JSON.parse(content);
    }

    // Add timestamp
    const resultWithTimestamp = {
      ...data,
      timestamp: data.timestamp || Date.now()
    };

    // Add new result (keep last 100)
    results.unshift(resultWithTimestamp);
    if (results.length > 100) {
      results = results.slice(0, 100);
    }

    // Save to file
    await writeFile(RESULTS_FILE, JSON.stringify(results, null, 2));

    console.log('[Webhook] ✅ Result saved successfully');

    res.json({ success: true, message: 'Result received and saved' });

  } catch (error) {
    console.error('[Webhook] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /results - get all results
app.get('/results', async (req, res) => {
  try {
    if (!existsSync(RESULTS_FILE)) {
      return res.json([]);
    }

    const content = await readFile(RESULTS_FILE, 'utf-8');
    const results = JSON.parse(content);

    res.json(results);
  } catch (error) {
    console.error('[Results API] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /results/:jobId - get specific result
app.get('/results/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!existsSync(RESULTS_FILE)) {
      return res.status(404).json({ error: 'No results found' });
    }

    const content = await readFile(RESULTS_FILE, 'utf-8');
    const results = JSON.parse(content);

    const result = results.find(r => 
      r.jobId === jobId || 
      r.jobId === `job_${jobId}` ||
      String(r.jobId).includes(jobId)
    );

    if (!result) {
      return res.status(404).json({ error: `Result not found for job ${jobId}` });
    }

    res.json(result);

  } catch (error) {
    console.error('[Results API] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[Webhook Server] Running on http://localhost:${PORT}`);
  console.log(`[Webhook Server] Endpoints:`);
  console.log(`  POST /webhook/results - Receive results from agent`);
  console.log(`  GET  /results - Get all results`);
  console.log(`  GET  /results/:jobId - Get specific result`);
});
