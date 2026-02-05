// Simple test to check if server can start without errors
const express = require('express');
const path = require('path');

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Test route
app.get('/', (req, res) => {
    res.send('Server is working! CSS file exists at: /css/style.css');
});

// Test login page
app.get('/login', (req, res) => {
    res.render('pages/login', { error: null, message: null });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Test server running on port ${PORT}`);
    console.log(`📱 Visit: http://localhost:${PORT}`);
    console.log(`🔧 Login page: http://localhost:${PORT}/login`);
});
