const express = require('express');
const dotenv = require('dotenv');
const routes = require('./routes');
const asiaRoutes = require('./asia/routes');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - Komiku.id (Original)
app.use('/api', routes);

// Routes - Komiku.asia (New source)
app.use('/api/asia', asiaRoutes);

// Add new route for komikkuya URL
app.get('/komikkuya', (req, res) => {
  res.json({
    url: 'https://komikkuya.my.id/'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 