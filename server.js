const express = require('express');
const bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth');
const child_process = require('child_process');
const http = require('http'); // Use HTTP module instead of HTTPS
const fs = require('fs');
const path = require('path');

// Middleware
const app = express();
app.use(bodyParser.json());
app.use(basicAuth({ users: { [process.env.USERNAME]: process.env.PASSWORD }, challenge: true }));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/convert', (req, res) => {
    let input = req.body.input;
    fs.readFile('sed_config', 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error reading sed config file' });
            return;
        }
        let sedCommands = data.split('\n');
        sedCommands.forEach(command => {
            try {
                input = child_process.execSync(`echo "${input.replace(/"/g, '\\"')}" | sed "${command}"`).toString();
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: 'Error executing sed command' });
                return;
            }
        });
        res.json({ output: input.trim() });
    });
});

// Create an HTTP server instead of HTTPS
http.createServer(app).listen(3002, '0.0.0.0', () => {
    console.log('Server running on port 3002');
});
