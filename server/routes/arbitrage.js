const express = require('express');
const { exec } = require('child_process');
const path = require('path');
// Full path to the Python interpreter in your virtual environment
const pythonPath = path.join('./scripts/DeCentMaker/venv/bin/python');

const router = express.Router();

// Function to parse the Python script output and convert it to JSON
function parseArbitrageOutput(output) {
    const lines = output.split('\n');
    const results = [];
    let currentPair = null;

    lines.forEach(line => {
        line = line.trim();

        // Identify the pair being checked
        if (line.startsWith('Checking arbitrage for pair:')) {
            currentPair = line.replace('Checking arbitrage for pair: ', '').trim();
        }

        // Identify net profit
        else if (line.startsWith('Net Profit After Fees for')) {
            const netProfit = line.split(': ')[1].trim();
            results.push({
                pair: currentPair,
                netProfit: netProfit,
                profitOpportunity: false // Default to false, update later if needed
            });
        }

        // Identify if there is an arbitrage opportunity
        else if (line.startsWith('Arbitrage Opportunity:')) {
            const lastResult = results[results.length - 1];
            if (lastResult && line.includes('Profit possible')) {
                lastResult.profitOpportunity = true;
            }
        }

        // Identify if there's no profitable opportunity
        else if (line.startsWith('No profitable arbitrage opportunity')) {
            const lastResult = results[results.length - 1];
            if (lastResult) {
                lastResult.profitOpportunity = false;
            }
        }
    });

    return { pairs: results };
}

// Route to trigger Python arbitrage script
router.post('/arbitrage', (req, res) => {
    exec('${pythonPath} ./scripts/DeCentMaker/Polygon_Arbitrage/polygon_arbitrage.py', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ error: 'Failed to execute script' });
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ error: 'Script error' });
        }

        try {
            const output = parseArbitrageOutput(stdout);
            res.json(output);
        } catch (parseError) {
            console.error(`Failed to parse script output: ${parseError}`);
            res.status(500).json({ error: 'Failed to parse script output' });
        }
    });
});

module.exports = router;