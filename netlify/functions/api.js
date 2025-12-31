const serverless = require('serverless-http');
const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const routes = require('../../src/routes');
const asiaRoutes = require('../../src/asia/routes');
const internationalRoutes = require('../../src/international/routes');
const doujinRoutes = require('../../src/doujin/routes');

// Routes
app.use('/api', routes);
app.use('/api/asia', asiaRoutes);
app.use('/api/international', internationalRoutes);
app.use('/api/doujin', doujinRoutes);

// Komikkuya endpoint
app.get('/komikkuya', (req, res) => {
    res.json({ url: 'https://komikkuya.my.id/' });
});

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Komiku API is running on Netlify' });
});

// Export handler for Netlify
module.exports.handler = serverless(app);
