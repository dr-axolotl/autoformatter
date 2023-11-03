const express = require('express');
const bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth');
const child_process = require('child_process');
const https = require('https');
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

// HTTPS options
const options =  {
    key: fs.readFileSync('/etc/ssl/private/privkey.pem'),
    cert: fs.readFileSync('/etc/ssl/certs/fullchain.pem')
};

// HTTPS Server
https.createServer(options, app).listen(3001, '0.0.0.0', () => {
    console.log('Server running on port 3001');
});

